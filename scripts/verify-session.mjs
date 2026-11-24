#!/usr/bin/env node
/**
 * 会话自检（并行开发用）：不写任何入库文件，只做类型 + 模板 + 对齐校验。
 *
 * 与 `pnpm verify` 的区别：
 * - `verify` 是 integrator 用的：会重新 gen:api 覆盖入库生成物，再 check:demos/check:align/build:lib。
 * - `verify:session` 是开发会话用的：把 API 产物写到 `.local-cache/api.session.json`，
 *   不碰 `packages/docs/src/app/api/api.generated.json`，因此不会和其它会话冲突。
 *
 * 用法：pnpm verify:session [-- TTable]
 *   - TypeScript 编译（库源码，不校验模板）
 *   - ngc 编译文档站（strictTemplates，能抓模板错误，如模板引用 private 成员）
 *   - align-check（读会话自己的 api.session.json，可只校验单个组件）
 *
 * 注意：改了组件 input/output 时必须先跑本脚本（它内部会 gen 到会话文件），
 * 否则 align-check 读到的是旧数据，会误报 missing。
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const API_SESSION = '.local-cache/api.session.json';
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

function run(label, command, args, extraEnv = {}) {
  console.log(`\n▶ ${label}`);
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  });
  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  if (result.status !== 0) {
    console.error(`\n✗ ${label} 失败（exit ${result.status}，${seconds}s）`);
    process.exit(result.status ?? 1);
  }
  console.log(`✓ ${label}（${seconds}s）`);
}

mkdirSync(resolve(ROOT, '.local-cache'), { recursive: true });

run('gen:api → .local-cache/api.session.json', 'node', ['scripts/gen-api-docs.mjs'], {
  API_OUT: API_SESSION,
});

run(
  'tsc（库源码类型）',
  'pnpm',
  ['exec', 'tsc', '-p', 'packages/ng-components/tsconfig.lib.json', '--noEmit', '--sourceMap'],
);

run('ngc（文档站模板，strictTemplates）', 'pnpm', [
  'exec',
  'ngc',
  '-p',
  'packages/docs/tsconfig.json',
  '--noEmit',
]);

run(
  'align-check（读会话 API 数据）',
  'node',
  only.length ? ['scripts/align-check.mjs', '--component', only[0]] : ['scripts/align-check.mjs'],
  { API_FILE: API_SESSION },
);

console.log('\n全部通过。提交前请告知 integrator：本次改了哪些组件、哪些上游属性标了 [D#] 欠账。');
