#!/usr/bin/env node
/**
 * 生成每个组件的开发进度文档：`docs/progress/<dir>.md` + `docs/progress/README.md`。
 *
 * 数据来源（全部是仓库里已有的真源，不引入新状态）：
 * - `align-check --json`：上游属性总数、已对齐数、未登记缺失、`ignoreUpstream` 债务原因；
 * - `packages/docs/src/app/api/api.generated.json`：已实现的输入/事件、源码路径、selector；
 * - `scripts/align-check.config/<TXxx>.mjs`：上游目录名与接口名；
 * - `packages/docs/src/app/docs/<dir>/demos/*.ts`：示例数量；
 * - `packages/docs/src/app/docs/nav.ts`：中文名（`label`）。
 *
 * 用法：
 *   node scripts/gen-progress-docs.mjs            # 重新生成
 *   node scripts/gen-progress-docs.mjs --check    # 只校验是否最新（CI / verify 用）
 *
 * 约定：文档是**生成物**，不要手改；进度真相仍是 align-check 与源码。
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { BUCKET_LABELS, classifyDebt } from './lib/debt.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs/progress');
const API_FILE = join(ROOT, 'packages/docs/src/app/api/api.generated.json');
const NAV_FILE = join(ROOT, 'packages/docs/src/app/docs/nav.ts');
const CONFIG_DIR = join(ROOT, 'scripts/align-check.config');
const DOCS_DIR = join(ROOT, 'packages/docs/src/app/docs');
const TMP_ALIGN = join(ROOT, '.local-cache/align-progress.json');
const checkOnly = process.argv.includes('--check');

/** 跑一次 align-check 并把 JSON 落到 .local-cache（避免 PowerShell 的 UTF-16 重定向）。 */
function loadAlignReport() {
  mkdirSync(dirname(TMP_ALIGN), { recursive: true });
  const args = ['scripts/align-check.mjs', '--json'];
  const options = { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 };
  let stdout;
  try {
    stdout = execFileSync(process.execPath, args, options);
  } catch (error) {
    // 存在漂移时 align-check 会以非 0 退出，但 stdout 仍是完整 JSON——进度文档正是要把漂移显示出来，
    // 所以这里降级为「读取输出」而不是直接失败（否则并行会话期间没人能生成进度文档）。
    stdout = error.stdout ?? '';
    if (!stdout.trim().startsWith('{')) throw error;
  }
  writeFileSync(TMP_ALIGN, stdout, 'utf8');
  return JSON.parse(stdout);
}

async function loadConfigs() {
  const configs = new Map();
  for (const file of readdirSync(CONFIG_DIR)) {
    if (!file.endsWith('.mjs') || file === 'index.mjs' || file === 'shared.mjs') continue;
    const mod = await import(`file://${join(CONFIG_DIR, file).replace(/\\/g, '/')}`);
    configs.set(file.replace(/\.mjs$/, ''), mod.default ?? {});
  }
  return configs;
}

function loadNavLabels() {
  const labels = new Map();
  const text = readFileSync(NAV_FILE, 'utf8');
  for (const match of text.matchAll(/path:\s*'\/([a-z0-9-]+)',\s*label:\s*'([^']+)'/g)) {
    labels.set(match[1], match[2]);
  }
  return labels;
}

function ratio(aligned, total) {
  if (!total) return '—';
  return `${((aligned / total) * 100).toFixed(1)}%`;
}

/** markdown 表格单元格转义：`|` 会破坏列。 */
function cell(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function demoFiles(dir) {
  const demosDir = join(DOCS_DIR, dir, 'demos');
  if (!existsSync(demosDir)) return [];
  return readdirSync(demosDir)
    .filter((file) => file.endsWith('.ts'))
    .sort();
}

function pageFile(dir) {
  const file = join(DOCS_DIR, dir, `${dir}.component.ts`);
  return existsSync(file) ? `packages/docs/src/app/docs/${dir}/${dir}.component.ts` : null;
}

function main() {
  const align = loadAlignReport();
  const api = JSON.parse(readFileSync(API_FILE, 'utf8'));
  const labels = loadNavLabels();

  return loadConfigs().then((configs) => {
    // 按目录聚合：目录以 api.generated.json 里的源码路径为准（CheckTag 这类跨目录复用 upstream 的组件才对得上）。
    const dirs = new Map();
    const noUpstream = [];
    for (const entry of align.components) {
      const config = configs.get(entry.className) ?? {};
      if (config.upstream === null) {
        // `upstream: null` 表示上游没有对应组件（如 TButtonGroup / TScrollbar / 内部 TThumb），
        // 不参与覆盖率统计，只在 README 里单列一条说明。
        noUpstream.push({ className: entry.className, reason: config.reason ?? '' });
        continue;
      }
      const apiEntry = api.components[entry.className];
      const file = apiEntry?.file ?? '';
      const match = /\/components\/([^/]+)\//.exec(file);
      const dir = match ? match[1] : (config.upstream ?? entry.upstream ?? 'misc');
      if (!dirs.has(dir)) dirs.set(dir, []);
      dirs.get(dir).push({ ...entry, api: apiEntry, config });
    }

    const rows = [];
    const files = new Map();
    for (const [dir, entries] of [...dirs].sort((a, b) => a[0].localeCompare(b[0]))) {
      entries.sort((a, b) => a.className.localeCompare(b.className));
      const upstreamTotal = entries.reduce((sum, item) => sum + item.upstreamTotal, 0);
      const aligned = entries.reduce((sum, item) => sum + item.aligned, 0);
      const missing = entries.reduce((sum, item) => sum + item.missing.length, 0);
      const debt = { D1: 0, D2: 0, D3: 0, map: 0 };
      for (const item of entries) {
        for (const ignored of item.ignored) {
          if (ignored.inUpstream === false) continue;
          debt[classifyDebt(item.className, ignored.reason).bucket] += 1;
        }
      }
      // 「Angular 惯用映射」不是欠账（插槽 / 双向绑定 / 事件名），单独计数。
      const debtTotal = debt.D1 + debt.D2 + debt.D3;
      const demos = demoFiles(dir);
      const label = labels.get(dir) ?? dir;

      files.set(
        join(OUT_DIR, `${dir}.md`),
        renderComponent({ dir, label, entries, upstreamTotal, aligned, missing, debt, debtTotal, demos }),
      );

      rows.push({ dir, label, upstreamTotal, aligned, missing, debt, debtTotal, demos: demos.length });
    }

    files.set(join(OUT_DIR, 'README.md'), renderIndex(rows, align.totals, noUpstream));

    if (checkOnly) {
      const stale = [];
      for (const [file, content] of files) {
        const current = existsSync(file) ? readFileSync(file, 'utf8') : null;
        if (current !== content) stale.push(file.replace(`${ROOT}\\`, '').replace(`${ROOT}/`, ''));
      }
      if (stale.length) {
        console.error(`进度文档不是最新（${stale.length} 个）：`);
        for (const file of stale.slice(0, 50)) console.error(`  - ${file}`);
        console.error('请运行 `pnpm gen:progress` 后重新提交。');
        process.exit(1);
      }
      console.log(`进度文档已是最新：README.md + ${rows.length} 个组件文档。`);
      return;
    }

    for (const [file, content] of files) writeFileSync(file, content, 'utf8');
    console.log(`已生成 docs/progress/README.md 与 ${rows.length} 个组件进度文档。`);
  });
}

function renderComponent({ dir, label, entries, upstreamTotal, aligned, missing, debt, debtTotal, demos }) {
  const status =
    missing > 0
      ? `⚠️ 有 ${missing} 项未登记缺失（需补 align-check 或实现）`
      : debtTotal > 0
        ? `🚧 有深度债 ${debtTotal} 项`
        : '✅ 已对齐上游全部属性';

  const lines = [];
  lines.push(`# ${label} · 开发进度`);
  lines.push('');
  lines.push('> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。');
  lines.push('');
  lines.push(`- 目录：\`packages/ng-components/src/components/${dir}/\``);
  if (pageFile(dir)) lines.push(`- 文档页：\`/${dir}\`（\`${pageFile(dir)}\`）`);
  lines.push(`- 状态：${status}`);
  lines.push('');
  lines.push('## 概览');
  lines.push('');
  lines.push('| 指标 | 数值 |');
  lines.push('| --- | --- |');
  lines.push(`| 上游属性 | ${upstreamTotal} |`);
  lines.push(`| 已对齐 | ${aligned} |`);
  lines.push(`| 覆盖率 | ${ratio(aligned, upstreamTotal)} |`);
  lines.push(`| 深度债 | ${debtTotal}（D1 ${debt.D1} / D2 ${debt.D2} / D3 ${debt.D3}） |`);
  lines.push(`| Angular 惯用映射 | ${debt.map}（插槽 / 双向绑定 / 事件名，不计债） |`);
  lines.push(`| 未登记缺失 | ${missing} |`);
  lines.push(`| 文档示例 | ${demos.length} 个 |`);
  lines.push('');
  lines.push('## 组件明细');
  lines.push('');

  for (const entry of entries) {
    const inputs = entry.api?.inputs ?? [];
    const outputs = entry.api?.outputs ?? [];
    const debts = entry.ignored.filter((item) => item.inUpstream !== false);
    lines.push(`### \`${entry.className}\`（\`<${entry.api?.selector ?? entry.className.toLowerCase()}>\`）`);
    lines.push('');
    // 配置里没写 upstreamInterface 的，按「Td + 类名去掉 T + Props」推断（TInput → TdInputProps）；
    // 少数接口名另有其名（如 TTable → TdBaseTableProps）的都在配置里显式写了。
    const upstreamInterface =
      entry.config.upstreamInterface ?? `Td${entry.className.replace(/^T/, '')}Props`;
    lines.push(
      `上游接口 \`${upstreamInterface}\`；上游属性 ${entry.upstreamTotal}、已对齐 ${entry.aligned}（${ratio(entry.aligned, entry.upstreamTotal)}）；深度债 ${debts.filter((item) => classifyDebt(entry.className, item.reason).bucket !== 'map').length} 项；未登记缺失 ${entry.missing.length} 项。`,
    );
    lines.push('');

    if (inputs.length) {
      lines.push('**已实现输入**');
      lines.push('');
      lines.push('| 属性 | 类型 | 默认值 | 说明 |');
      lines.push('| --- | --- | --- | --- |');
      for (const input of inputs) {
        lines.push(
          `| \`${input.name}\` | ${cell(input.type)} | ${cell(input.default)} | ${cell(input.zh || input.en)} |`,
        );
      }
      lines.push('');
    }

    if (outputs.length) {
      lines.push('**已实现事件**');
      lines.push('');
      lines.push('| 事件 | 参数 | 说明 |');
      lines.push('| --- | --- | --- |');
      for (const output of outputs) {
        lines.push(`| \`${output.name}\` | ${cell(output.type)} | ${cell(output.zh || output.en)} |`);
      }
      lines.push('');
    }

    if (debts.length || entry.missing.length) {
      lines.push('**未实现（深度债）**');
      lines.push('');
      if (debts.length) {
        lines.push('| 上游属性 | 类别 | 原因 |');
        lines.push('| --- | --- | --- |');
        for (const ignored of [...debts].sort((a, b) => a.name.localeCompare(b.name))) {
          const bucket = classifyDebt(entry.className, ignored.reason).bucket;
          lines.push(`| \`${ignored.name}\` | ${BUCKET_LABELS[bucket]} | ${cell(ignored.reason)} |`);
        }
      }
      for (const name of entry.missing) {
        lines.push(`| \`${name}\` | ⚠️ 未登记 | 尚未实现也未在 \`scripts/align-check.config/${entry.className}.mjs\` 登记原因 |`);
      }
      lines.push('');
    }
  }

  if (demos.length) {
    lines.push('## 文档示例');
    lines.push('');
    for (const file of demos) {
      lines.push(`- \`packages/docs/src/app/docs/${dir}/demos/${file}\``);
    }
    lines.push('');
  }

  return lines.join('\n');
}

function renderIndex(rows, totals, noUpstream = []) {
  const debtTotal = rows.reduce((sum, row) => sum + row.debtTotal, 0);
  const complete = rows.filter((row) => row.debtTotal === 0 && row.missing === 0).length;
  const lines = [];
  lines.push('# 组件开发进度');
  lines.push('');
  lines.push('> 本文件由 `pnpm gen:progress` 生成，请勿手改。每个组件的明细见同目录 `<组件目录>.md`。');
  lines.push('');
  lines.push('| 指标 | 数值 |');
  lines.push('| --- | --- |');
  lines.push(`| 组件目录 | ${rows.length} |`);
  lines.push(`| 上游属性 | ${totals.upstreamProps} |`);
  lines.push(`| 已对齐 | ${totals.aligned} |`);
  lines.push(`| 覆盖率 | ${ratio(totals.aligned, totals.upstreamProps)} |`);
  lines.push(`| 深度债 | ${debtTotal} 项 |`);
  lines.push(`| 零债务组件 | ${complete} / ${rows.length} |`);
  lines.push('');
  lines.push('状态图例：✅ 无债务；🚧 有深度债（D1 表格与选择线 / D2 录入与反馈 / D3 其余）；⚠️ 有未登记缺失。');
  lines.push('');
  lines.push('## 按覆盖率排序');
  lines.push('');
  lines.push('| 组件 | 目录 | 上游 | 已对齐 | 覆盖率 | D1 | D2 | D3 | 未登记 | 示例 | 状态 |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  const sorted = [...rows].sort((a, b) => {
    const ra = a.upstreamTotal ? a.aligned / a.upstreamTotal : 1;
    const rb = b.upstreamTotal ? b.aligned / b.upstreamTotal : 1;
    return ra - rb || a.dir.localeCompare(b.dir);
  });
  for (const row of sorted) {
    const status = row.missing > 0 ? '⚠️' : row.debtTotal > 0 ? '🚧' : '✅';
    lines.push(
      `| [${cell(row.label)}](${row.dir}.md) | \`${row.dir}\` | ${row.upstreamTotal} | ${row.aligned} | ${ratio(row.aligned, row.upstreamTotal)} | ${row.debt.D1} | ${row.debt.D2} | ${row.debt.D3} | ${row.missing} | ${row.demos} | ${status} |`,
    );
  }
  lines.push('');
  if (noUpstream.length) {
    lines.push('## 无上游对照');
    lines.push('');
    lines.push('这些类在 `align-check.config` 里声明了 `upstream: null`，不参与覆盖率统计。');
    lines.push('');
    lines.push('| 类 | 说明 |');
    lines.push('| --- | --- |');
    for (const item of [...noUpstream].sort((a, b) => a.className.localeCompare(b.className))) {
      lines.push(`| \`${item.className}\` | ${cell(item.reason)} |`);
    }
    lines.push('');
  }
  lines.push('## 怎么更新');
  lines.push('');
  lines.push('```bash');
  lines.push('pnpm gen:progress     # 按当前源码与 align-check 重新生成');
  lines.push('pnpm check:progress   # 校验入库版本是否最新（integrator 跑）');
  lines.push('```');
  lines.push('');
  lines.push('债务分类来自 `scripts/align-check.config/<TXxx>.mjs` 的 `ignoreUpstream` 原因前缀；`pnpm depth:report` 会给出同一套口径的汇总。');
  lines.push('');
  return lines.join('\n');
}

mkdirSync(OUT_DIR, { recursive: true });
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
