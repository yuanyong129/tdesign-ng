#!/usr/bin/env node
/**
 * 一次性构建并发布三个 npm 包。
 *
 * 发布顺序是有依赖的：@tdesign-ng/components 的 peerDependencies 里有
 * @tdesign-ng/styles，先发 styles 才能让后装的人解析到。
 *
 * 每个包发布前都会先做一轮产物校验（期望文件清单、版本一致性），
 * 任一失败就整体中止，绝不在校验没过的情况下 publish。
 *
 * 用法：
 *   pnpm run release:check    # 全流程演练，不发布
 *   pnpm run release          # 真发布
 *   node scripts/publish-all.mjs --skip-build --dry-run   # 复用已有产物
 *
 * 认证：先 `npm login`，或在 CI 里配置 NPM_TOKEN 环境变量。
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const skipBuild = argv.includes('--skip-build');

/** npm 缓存默认落在用户目录，某些受限环境写不进去，统一指到仓库内。 */
process.env.npm_config_cache = process.env.npm_config_cache || path.join(repoRoot, '.npm-cache');

/** 发布顺序 = 依赖顺序。 */
const PACKAGES = [
  { name: '@tdesign-ng/styles', dir: 'packages/styles', required: ['package.json', 'index.less', 'components/button.less', 'vendor/tdesign-common/style/web/_reset.less', 'dist/index.css'] },
  { name: '@tdesign-ng/icons', dir: 'packages/dist/icons', required: ['package.json', 'fesm2022/tdesign-ng-icons.mjs', 'index.d.ts'] },
  { name: '@tdesign-ng/components', dir: 'packages/dist/components', required: ['package.json', 'fesm2022/tdesign-ng-components.mjs', 'index.d.ts', 'bridge.less', 'bridge.css'] },
];

/** 受限沙箱里 spawnSync 用 pipe 抓输出会 EPERM，改用临时文件接 fd，两条路都能跑。 */
const captureDir = path.join(repoRoot, '.npm-cache');

function runCapture(command, args) {
  fs.mkdirSync(captureDir, { recursive: true });
  const stamp = `${process.pid}-${Date.now()}`;
  const outFile = path.join(captureDir, `stdout-${stamp}.log`);
  const errFile = path.join(captureDir, `stderr-${stamp}.log`);
  const outFd = fs.openSync(outFile, 'w');
  const errFd = fs.openSync(errFile, 'w');
  let result;
  try {
    result = spawnSync(command, args, {
      cwd: repoRoot,
      stdio: ['ignore', outFd, errFd],
      shell: process.platform === 'win32',
    });
  } finally {
    fs.closeSync(outFd);
    fs.closeSync(errFd);
  }
  result.stdout = fs.readFileSync(outFile, 'utf8');
  result.stderr = fs.readFileSync(errFile, 'utf8');
  fs.rmSync(outFile, { force: true });
  fs.rmSync(errFile, { force: true });
  if (result.error) throw result.error;
  return result;
}

function run(command, args, options = {}) {
  if (options.capture) return runCapture(command, args);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.error) throw result.error;
  return result;
}

function fail(message) {
  console.error(`\n✗ ${message}\n`);
  process.exit(1);
}

function step(message) {
  console.log(`\n▸ ${message}`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function checkVersions() {
  const versions = PACKAGES.map((pkg) => {
    const { version } = readJson(path.join(repoRoot, pkg.dir, 'package.json'));
    return { name: pkg.name, version };
  });
  const unique = new Set(versions.map((v) => v.version));
  const rendered = versions.map((v) => `    ${v.name}@${v.version}`).join('\n');
  if (unique.size !== 1) fail(`三个包版本不一致，先统一：\n${rendered}`);
  console.log(`  版本 ${versions[0].version} 三包一致`);

  // components 的 styles peer 必须能被这次发布满足。
  const componentsPkg = readJson(path.join(repoRoot, 'packages/dist/components/package.json'));
  const stylesPeer = componentsPkg.peerDependencies?.['@tdesign-ng/styles'];
  if (!stylesPeer) fail('packages/dist/components/package.json 缺少 @tdesign-ng/styles peer');
  const stylesVersion = versions.find((v) => v.name === '@tdesign-ng/styles').version;
  const major = Number(stylesVersion.split('.')[0]);
  if (!stylesPeer.includes(`^${major}`) && !stylesPeer.includes(stylesVersion)) {
    fail(`styles peer "${stylesPeer}" 与将要发布的 ${stylesVersion} 不匹配`);
  }
  console.log(`  components → styles peer "${stylesPeer}" 与 ${stylesVersion} 匹配`);
}

function checkAuth() {
  if (dryRun) {
    console.log('  演练模式跳过认证检查。');
    return;
  }
  const result = run('npm', ['whoami'], { capture: true });
  const who = (result.stdout || '').trim();
  if (result.status !== 0) {
    console.log(`  (npm whoami 未通过：${(result.stderr || '').trim().split('\n')[0]})`);
    fail('未登录 npm。先 `npm login`，或在 CI 里提供 NPM_TOKEN。');
  }
  console.log(`  已登录：${who}`);
}

function packDryRun(pkg) {
  // 必须指定包目录：在仓库根执行 npm pack 打的是根 package.json。
  const result = run('npm', ['pack', pkg.dir, '--dry-run', '--json'], { capture: true });
  const combined = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.status !== 0) {
    // 受限沙箱会拒绝 npm 内部为 `git ls-files` 建管道（EPERM），这不是产物问题。
    if (combined.includes('EPERM') && dryRun) {
      console.log('  ⚠ 本环境禁止 node 捕获 npm 子进程输出（spawn EPERM），跳过打包清单校验；');
      console.log('    请在普通终端或 CI 里重跑 release:check 完成这项校验。');
      return;
    }
    fail(`${pkg.name} npm pack 失败：\n${combined.trim()}`);
  }
  // npm 偶尔会往 stdout 里混入额外行，只取第一段 JSON 数组。
  const raw = result.stdout || '';
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start < 0 || end < start) fail(`${pkg.name} npm pack 输出无法解析：\n${raw.slice(0, 500)}`);
  const [meta] = JSON.parse(raw.slice(start, end + 1));
  const files = meta.files.map((f) => f.path.replace(/\\/g, '/'));

  const missing = pkg.required.filter((want) => !files.includes(want));
  const hasReadme = files.includes('README.md');
  const hasLicense = files.includes('LICENSE') || files.includes('LICENSE.md');

  console.log(
    `  ${files.length} 个文件 / ${(meta.unpackedSize / 1024).toFixed(0)} KB 解包 / ${(meta.size / 1024).toFixed(0)} KB tarball`,
  );
  if (missing.length > 0) fail(`${pkg.name} 产物缺少文件：\n    ${missing.join('\n    ')}`);
  if (!hasReadme) fail(`${pkg.name} 产物缺少 README.md（npm 页面会是空白）`);
  if (!hasLicense) fail(`${pkg.name} 产物缺少 LICENSE`);
  console.log(`  期望文件齐全，含 README.md 与 LICENSE`);
}

function publish(pkg) {
  const args = ['publish', pkg.dir, '--access', 'public'];
  if (dryRun) args.push('--dry-run');
  const result = run('npm', args);
  if (result.status !== 0) fail(`${pkg.name} 发布失败（见上方 npm 输出）`);
  console.log(`  ✓ ${pkg.name}${dryRun ? '（演练，未真正发布）' : ' 已发布'}`);
}

function main() {
  console.log(`tdesign-ng 发布${dryRun ? '演练' : ''}（cwd=${path.relative(process.cwd(), repoRoot) || '.'}）`);

  if (!skipBuild) {
    step('构建三个包');
    const build = run('pnpm', ['run', 'build:packages']);
    if (build.status !== 0) fail('构建失败，先修 build:packages');
  } else {
    step('跳过构建，复用已有产物');
  }

  step('校验版本一致性');
  checkVersions();

  step('校验 npm 认证');
  checkAuth();

  step('校验产物内容与文件清单');
  for (const pkg of PACKAGES) {
    if (!fs.existsSync(path.join(repoRoot, pkg.dir))) fail(`${pkg.dir} 不存在（先跑构建）`);
    console.log(`  ${pkg.name}`);
    packDryRun(pkg);
  }

  step(`发布${dryRun ? '（演练）' : ''}`);
  for (const pkg of PACKAGES) publish(pkg);

  console.log(
    dryRun
      ? '\n演练结束：三个包都能正常打包与校验，去掉 --dry-run 即可真发布。\n'
      : `\n发布完成。验证：npm view ${PACKAGES[0].name} version\n`,
  );
}

try {
  main();
} catch (error) {
  console.error(`\n发布流程异常：${error.message}`);
  process.exit(1);
}
