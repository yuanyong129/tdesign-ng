#!/usr/bin/env node
/**
 * 把上游 tdesign-common 的样式源码（style/web）同步到 vendor/tdesign-common。
 *
 * 约定：
 * - vendor/ 下是上游源码的**逐字节快照**，不允许手改；改动只会被下一次同步覆盖。
 * - 我们的样式包 packages/styles 只做"入口装配"（import 上游文件），不复制、不改写样式。
 * - 同步后自动重建 packages/styles/src 下的组件入口文件，新增/删除上游组件都能跟上。
 *
 * 用法：
 *   node scripts/vendor-tdesign-common.mjs                # 同步默认分支 develop
 *   node scripts/vendor-tdesign-common.mjs --ref v1.0.0   # 同步指定分支/tag
 *   node scripts/vendor-tdesign-common.mjs --from <tar>   # 用本地已经下好的 tarball（离线）
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = 'Tencent/tdesign-common';
const DEFAULT_REF = 'develop';
/** 只同步 PC 端样式；mobile 端不在本项目范围内。 */
const STYLE_SUBDIR = path.join('style', 'web');

/**
 * 上游 components 目录里不是真组件的条目：
 * a-template 是新建组件时用的脚手架（选择器写的是 `.@{prefix}-<name >` 占位符），
 * 直接当 less 编译会报 Unrecognised input。
 */
const SKIP_COMPONENTS = new Set(['a-template']);

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendorDir = path.join(repoRoot, 'vendor', 'tdesign-common');
const stylesPkgDir = path.join(repoRoot, 'packages', 'styles');

function parseArgs(argv) {
  const args = { ref: DEFAULT_REF, from: null };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--ref') args.ref = argv[i + 1];
    else if (token === '--from') args.from = argv[i + 1];
  }
  return args;
}

async function download(ref) {
  const url = `https://codeload.github.com/${REPO}/tar.gz/refs/heads/${ref}`;
  process.stdout.write(`  下载 ${url}\n`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`下载失败：HTTP ${response.status} ${url}（tag 请用 --ref，codeload 的 tar.gz/refs/heads 只接受分支）`);
  }
  const tmpFile = path.join(os.tmpdir(), `tdesign-common-${ref}-${Date.now()}.tar.gz`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(tmpFile, bytes);
  return { tmpFile, size: bytes.length };
}

function extract(tarball, destDir) {
  execFileSync('tar', ['-xzf', tarball, '-C', destDir], { stdio: 'inherit' });
}

async function findExtractedRoot(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());
  if (dirs.length !== 1) {
    throw new Error(`解压目录结构异常，期望只有一个顶层目录，实际 ${dirs.length} 个`);
  }
  return path.join(dir, dirs[0].name);
}

async function copyDir(from, to) {
  await fs.rm(to, { recursive: true, force: true });
  await fs.mkdir(to, { recursive: true });
  await fs.cp(from, to, { recursive: true });
}

/** 生成 packages/styles/src 下的入口文件（纯装配，不含样式代码）。 */
async function regenerateEntries(componentDirs) {
  const srcDir = path.join(stylesPkgDir, 'src');
  const compEntryDir = path.join(srcDir, 'components');
  await fs.mkdir(compEntryDir, { recursive: true });

  const banner = (name) =>
    `// 由 scripts/vendor-tdesign-common.mjs 生成，请勿手改。\n// 入口：TDesign ${name} 组件样式。\n\n`;

  const written = [];
  for (const name of componentDirs) {
    const rel = '../../../../vendor/tdesign-common/style/web/components/' + name + '/_index.less';
    const file = path.join(compEntryDir, `${name}.less`);
    await fs.writeFile(file, `${banner(name)}@import '${rel}';\n`, 'utf8');
    written.push(`components/${name}.less`);
  }

  const all = componentDirs.map((name) => `@import './${name}.less';`).join('\n');
  await fs.writeFile(
    path.join(compEntryDir, 'index.less'),
    `${banner('全部')}// 全量组件样式，体积较大，仅用于"图省事"的场景。\n\n${all}\n`,
    'utf8',
  );
  written.push('components/index.less');
  return written;
}

async function main() {
  const { ref, from } = parseArgs(process.argv.slice(2));
  const tmpRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'tdc-'));
  let tarball = from;
  let size = null;

  try {
    if (!tarball) {
      const downloaded = await download(ref);
      tarball = downloaded.tmpFile;
      size = downloaded.size;
    } else {
      process.stdout.write(`  使用本地 tarball ${tarball}\n`);
    }

    process.stdout.write('  解压...\n');
    extract(tarball, tmpRoot);
    const extractedRoot = await findExtractedRoot(tmpRoot);

    const srcStyle = path.join(extractedRoot, STYLE_SUBDIR);
    await fs.access(path.join(srcStyle, '_variables.less'));

    process.stdout.write('  写入 vendor/tdesign-common ...\n');
    await copyDir(srcStyle, path.join(vendorDir, STYLE_SUBDIR));
    await fs.copyFile(path.join(extractedRoot, 'LICENSE'), path.join(vendorDir, 'LICENSE'));

    const componentDirs = (await fs.readdir(path.join(srcStyle, 'components'), { withFileTypes: true }))
      .filter((e) => e.isDirectory() && !e.name.startsWith('_') && !SKIP_COMPONENTS.has(e.name))
      .map((e) => e.name)
      .sort();

    const meta = {
      repo: REPO,
      ref,
      styleDir: STYLE_SUBDIR,
      syncedAt: new Date().toISOString(),
      tarballBytes: size,
      componentCount: componentDirs.length,
      note: 'vendor 目录是上游源码的逐字节快照，请勿手改；用 node scripts/vendor-tdesign-common.mjs 重新同步。',
    };
    await fs.writeFile(path.join(vendorDir, 'VERSION.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');

    const entries = await regenerateEntries(componentDirs);

    process.stdout.write(
      `\n完成：上游 ${REPO}@${ref}，${componentDirs.length} 个组件样式，${entries.length} 个入口文件。\n`,
    );
  } finally {
    await fs.rm(tmpRoot, { recursive: true, force: true });
    if (tarball && !from) await fs.rm(tarball, { force: true });
  }
}

main().catch((error) => {
  console.error(`\n同步失败：${error.message}`);
  process.exit(1);
});
