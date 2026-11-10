#!/usr/bin/env node
/**
 * 把 packages/styles 的 less 入口编译成 CSS，输出到 packages/styles/dist。
 *
 * 产物：
 *   dist/index.css          推荐入口（令牌 + 全局 + reset）
 *   dist/theme.css          只有设计令牌
 *   dist/reset.css          只有统一化样式
 *   dist/global.css         令牌 + 全局工具类
 *   dist/components.css     全部组件样式（体积大，快速上手用）
 *   同名 *.min.css          压缩版本
 *
 * 用法：
 *   node scripts/build-styles.mjs
 *   node scripts/build-styles.mjs --check   # 只校验能编译通过，不写文件
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import less from 'less';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(repoRoot, 'packages', 'styles', 'src');
const outDir = path.join(repoRoot, 'packages', 'styles', 'dist');

const ENTRIES = [
  { name: 'index', file: path.join(srcDir, 'index.less') },
  { name: 'theme', file: path.join(srcDir, 'theme.less') },
  { name: 'reset', file: path.join(srcDir, 'reset.less') },
  { name: 'global', file: path.join(srcDir, 'global.less') },
  { name: 'components', file: path.join(srcDir, 'components', 'index.less') },
];

/**
 * 编译产物必须满足的最小断言。
 * 这些是"样式管线接错了"的早期信号，比人肉点页面靠得住。
 * 取值随上游演进，改动时请对照 vendor/tdesign-common/style/web 实际内容。
 */
const ASSERTIONS = {
  theme: [/--td-brand-color:\s*var\(--td-brand-color-\d+\)/i, /\[theme-mode=['"]?dark/i],
  components: [/\.t-button--variant-/, /\.t-divider--horizontal/],
};

async function compile(file, compress) {
  const result = await less.render(await fs.readFile(file, 'utf8'), {
    filename: file,
    compress,
    javascriptEnabled: true,
    /** 让 less 能按 npm 包名解析不带 ./ 前缀的 import，和 Angular 的行为保持一致。 */
    paths: [path.dirname(file)],
  });
  return result.css;
}

function assertOutput(name, css) {
  const rules = ASSERTIONS[name];
  if (!rules) return;
  const missing = rules.filter((rule) => !rule.test(css));
  if (missing.length > 0) {
    throw new Error(`${name}.css 缺少预期内容：${missing.map(String).join(' , ')}`);
  }
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  if (!checkOnly) await fs.mkdir(outDir, { recursive: true });

  const summary = [];
  for (const { name, file } of ENTRIES) {
    const started = Date.now();
    const css = await compile(file, false);
    assertOutput(name, css);
    const min = await compile(file, true);

    if (!checkOnly) {
      await fs.writeFile(path.join(outDir, `${name}.css`), `${css}\n`, 'utf8');
      await fs.writeFile(path.join(outDir, `${name}.min.css`), `${min}\n`, 'utf8');
    }
    summary.push({ name, bytes: css.length, minBytes: min.length, ms: Date.now() - started });
  }

  const width = Math.max(...summary.map((s) => s.name.length));
  for (const s of summary) {
    const pad = s.name.padEnd(width);
    process.stdout.write(
      `  ${pad}  ${(s.bytes / 1024).toFixed(1).padStart(7)} KB → ${(s.minBytes / 1024).toFixed(1).padStart(6)} KB  (${s.ms}ms)\n`,
    );
  }
  process.stdout.write(
    checkOnly ? '\n校验通过（未写文件）。\n' : `\n已输出到 ${path.relative(repoRoot, outDir)}\n`,
  );
}

main().catch((error) => {
  console.error(`\n样式编译失败：${error.message}`);
  if (error.line) console.error(`  位置：${error.filename}:${error.line}:${error.column}`);
  process.exit(1);
});
