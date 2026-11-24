#!/usr/bin/env node
/**
 * 把组件的样式桥接层（packages/ng-components/src/bridge.less）放进 npm 产物。
 *
 * 为什么需要这一步：
 *   组件全部 ViewEncapsulation.None 且没有任何内联样式，样式完全来自
 *   @tdesign-ng/styles 的上游 less。但上游选择器是 .t-button 这种类名选择器，
 *   而 Angular 组件渲染出的是 <t-button> 宿主元素，中间需要一个桥接层把
 *   宿主元素对上上游类名。bridge.less 就是这个桥接层，必须随
 *   @tdesign-ng/components 一起发布，否则用户装了包也是裸样式。
 *
 * 为什么还要编译成 css：
 *   bridge.less 里用的是 // 行注释（less 语法），不能直接改名成 .css 给
 *   不用 less 的项目引用，所以这里同时产出 bridge.css / bridge.min.css。
 *
 * 依赖：必须在 `pnpm run build:lib` 之后运行（要写进 packages/dist/components）。
 *
 * 用法：
 *   node scripts/build-components-assets.mjs
 *   node scripts/build-components-assets.mjs --check   # 只校验能编译，不写文件
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import less from 'less';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkgDir = path.join(repoRoot, 'packages', 'ng-components');
const source = path.join(pkgDir, 'src', 'bridge.less');
const outDir = path.join(repoRoot, 'packages', 'dist', 'components');

/** 桥接层接错了的信号：上游类名没对上，或者 host 没被打平。 */
const ASSERTIONS = [/\.t-button\b/, /t-button\s*[,{]/];

async function compile(compress) {
  const result = await less.render(await fs.readFile(source, 'utf8'), {
    filename: source,
    compress,
    javascriptEnabled: true,
    paths: [path.dirname(source)],
  });
  return result.css;
}

async function main() {
  const checkOnly = process.argv.includes('--check');

  if (!checkOnly) {
    const built = await fs
      .stat(path.join(outDir, 'fesm2022', 'tdesign-ng-components.mjs'))
      .catch(() => null);
    if (!built) {
      throw new Error(`${path.relative(repoRoot, outDir)} 里没有构建产物，请先运行 pnpm run build:lib`);
    }
  }

  const css = await compile(false);
  const missing = ASSERTIONS.filter((rule) => !rule.test(css));
  if (missing.length > 0) {
    throw new Error(`bridge.css 缺少预期内容：${missing.map(String).join(' , ')}`);
  }
  const min = await compile(true);

  if (checkOnly) {
    process.stdout.write(`\n校验通过（未写文件）。bridge.css ${(css.length / 1024).toFixed(1)} KB\n`);
    return;
  }

  await fs.copyFile(source, path.join(outDir, 'bridge.less'));
  await fs.writeFile(path.join(outDir, 'bridge.css'), `${css}\n`, 'utf8');
  await fs.writeFile(path.join(outDir, 'bridge.min.css'), `${min}\n`, 'utf8');

  // ng-packagr 生成的 exports 只有 "." 与 "./package.json"，桥接样式会被
  // 尊重 exports 的打包器（Vite/ESM）挡在外面，这里补上三个子路径。
  const manifestPath = path.join(outDir, 'package.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  manifest.exports = {
    ...manifest.exports,
    './bridge.less': './bridge.less',
    './bridge.css': './bridge.css',
    './bridge.min.css': './bridge.min.css',
  };
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  process.stdout.write(
    `  bridge.less   ${(await fs.stat(source)).size} B\n` +
      `  bridge.css    ${(css.length / 1024).toFixed(1)} KB → ${(min.length / 1024).toFixed(1)} KB\n` +
      `  package.json  已补充 bridge.* 子路径导出\n` +
      `\n已输出到 ${path.relative(repoRoot, outDir)}\n`,
  );
}

main().catch((error) => {
  console.error(`\n组件样式产物生成失败：${error.message}`);
  if (error.line) console.error(`  位置：${error.filename}:${error.line}:${error.column}`);
  process.exit(1);
});
