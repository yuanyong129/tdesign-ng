#!/usr/bin/env node
/**
 * 新组件接线脚本：把新组件接进 index.ts / nav.ts / app.routes.ts / styles.less。
 *
 * 为什么要入库：接线涉及 4 个共享文件，规则必须唯一，否则每个会话手写都会漏一处或者写错位置。
 * 注意：深度阶段（改已有组件）通常**不需要**跑这个脚本；它只服务于「新增组件/新增文档页」。
 *
 * 用法：
 *   node scripts/wire-component.mjs <dir> <ClassStem> <label> <group> <afterPath> [--no-less]
 * 例：
 *   node scripts/wire-component.mjs input-number InputNumber "数字输入框 InputNumber" 数据录入 /input
 *
 * 参数：
 *   dir       packages/ng-components/src/components/<dir> 的目录名，同时也是文档路由 /<dir>
 *   ClassStem 文档页类名前缀（<ClassStem>Docs）
 *   label     nav 里显示的「中文 English」
 *   group     nav 分组：通用 / 布局 / 导航 / 数据录入 / 反馈 / 数据展示 / 其他
 *   afterPath 锚点路由（插在该条之后），如 /input
 */
import fs from 'node:fs';
import path from 'node:path';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const withLess = !args.includes('--no-less');
const [dir, stem, label, group, afterPath] = args.filter((a) => !a.startsWith('--'));

if (!dir || !stem || !label || !group || !afterPath) {
  console.error('用法：node scripts/wire-component.mjs <dir> <ClassStem> <label> <group> <afterPath> [--no-less]');
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(dir)) {
  console.error(`目录名必须是 kebab-case：${dir}`);
  process.exit(1);
}

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, t) => fs.writeFileSync(path.join(ROOT, p), t, 'utf8');
const notes = [];
const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

/* ---------- 1. index.ts：按字母序插入 export ---------- */
{
  const p = 'packages/ng-components/src/index.ts';
  const t = read(p);
  const line = `export * from './components/${dir}';`;
  if (t.includes(line)) {
    notes.push(`index.ts: ${dir} 已存在，跳过`);
  } else {
    const lines = t.split(/\r?\n/);
    const exportsIdx = lines
      .map((l, i) => ({ l: l.trim(), i }))
      .filter((x) => /^export \* from '\.\/components\/[^']+';$/.test(x.l));
    if (!exportsIdx.length) fail('index.ts: 找不到任何 components 导出，检查文件结构');
    const pos = exportsIdx.findIndex((x) => x.l.localeCompare(line) > 0);
    const at = pos === -1 ? exportsIdx[exportsIdx.length - 1].i + 1 : exportsIdx[pos].i;
    lines.splice(at, 0, line);
    write(p, lines.join('\n'));
    notes.push(`index.ts: 插入 ${dir}（第 ${at + 1} 行）`);
  }
}

/* ---------- 2. nav.ts：插在锚点条目之后 ---------- */
{
  const p = 'packages/docs/src/app/docs/nav.ts';
  const t = read(p);
  if (t.includes(`path: '/${dir}'`)) {
    notes.push(`nav.ts: /${dir} 已存在，跳过`);
  } else {
    const lines = t.split(/\r?\n/);
    const anchorIdx = lines.findIndex((l) => l.includes(`path: '${afterPath}'`));
    if (anchorIdx === -1) fail(`nav.ts: 找不到锚点 ${afterPath}`);
    let end = anchorIdx;
    while (end < lines.length && !lines[end].includes('}')) end += 1;
    const indent = (lines[anchorIdx].match(/^\s*/) || [''])[0];
    lines.splice(end + 1, 0, `${indent}{ path: '/${dir}', label: '${label}', group: '${group}' },`);
    write(p, lines.join('\n'));
    notes.push(`nav.ts: 在 ${afterPath} 之后插入 /${dir}（第 ${end + 2} 行）`);
  }
}

/* ---------- 3. app.routes.ts：插在 ** 之前 ---------- */
{
  const p = 'packages/docs/src/app/app.routes.ts';
  let t = read(p);
  if (t.includes(`path: '${dir}'`)) {
    notes.push(`app.routes.ts: ${dir} 已存在，跳过`);
  } else {
    const route = [
      '  {',
      `    path: '${dir}',`,
      '    loadComponent: () =>',
      `      import('./docs/${dir}/${dir}.component').then((m) => m.${stem}Docs),`,
      '  },',
    ].join('\n');
    const anchor = /(  \{\n    path: '\*\*',)/;
    if (!anchor.test(t)) fail('app.routes.ts: 找不到 { path: "**" } 锚点（必须多行写法）');
    t = t.replace(anchor, `${route}\n$1`);
    write(p, t);
    notes.push(`app.routes.ts: 插入 ${dir} 路由（在 ** 之前）`);
  }
}

/* ---------- 4. styles.less：插在锚点 less 之后 ---------- */
if (withLess) {
  const p = 'packages/docs/src/styles.less';
  const t = read(p);
  const line = `@import '../../styles/src/components/${dir}.less';`;
  const target = path.join(ROOT, 'packages/styles/src/components', `${dir}.less`);
  if (t.includes(line)) {
    notes.push(`styles.less: ${dir}.less 已存在，跳过`);
  } else if (!fs.existsSync(target)) {
    notes.push(`styles.less: packages/styles/src/components/${dir}.less 不存在（无样式组件正常），跳过`);
  } else {
    const lines = t.split(/\r?\n/);
    const anchorName = afterPath.replace(/^\//, '');
    let at = lines.findIndex((l) => l.includes(`/components/${anchorName}.less`));
    if (at === -1) at = lines.length - 1;
    lines.splice(at + 1, 0, line);
    write(p, lines.join('\n'));
    notes.push(`styles.less: 在 ${anchorName}.less 之后插入 ${dir}.less（第 ${at + 2} 行）`);
  }
}

console.log(notes.join('\n'));
