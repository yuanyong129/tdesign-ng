#!/usr/bin/env node
/**
 * 深度债报表：把 align-check 的 ignoreUpstream 清单按 D1/D2/D3 三条深度线归类统计。
 *
 * 背景：广度阶段（B1~B4）只做 L1 基线，上游属性里暂时做不了的都进 ignoreUpstream，
 * reason 以 `[D1]` / `[D2]` / `[D3]` 开头。广度做完后，这张报表就是深度阶段的工作单：
 * 每条债都属于哪条线、哪个组件、欠多少。
 *
 * 数据来源：scripts/align-check.mjs --json（唯一真源，避免两份统计口径漂移）。
 *
 * 用法：
 *   node scripts/depth-report.mjs                    # 现算一遍，打印 markdown
 *   node scripts/depth-report.mjs --out report.md    # 写到文件
 *   node scripts/depth-report.mjs --from x.json      # 复用已有 json（不重新抓上游）
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const argv = process.argv.slice(2);
const FROM = argv.includes('--from') ? argv[argv.indexOf('--from') + 1] : null;
const OUT = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : null;

/**
 * 组件默认归属的深度线（与 docs/plans/breadth-first-roadmap.md §4.2 一致）。
 * reason 里显式的 `[D#]` 前缀优先于这张表：某个组件的个别属性可以提前/延后到别的线。
 */
const LINE_DEFAULTS = {
  D1: [
    'TTable',
    'TSelect',
    'TSelectInput',
    'TCascader',
    'TTree',
    'TTreeSelect',
    'TDatePicker',
    'TDateRangePicker',
    'TTimePicker',
    'TInputNumber',
    'TAutoComplete',
  ],
  D2: [
    'TInput',
    'TTextarea',
    'TForm',
    'TFormItem',
    'TUpload',
    'TTransfer',
    'TDialog',
    'TDrawer',
    'TPopup',
    'TMenu',
    'TDropdown',
    'TGuide',
  ],
};

const BUCKETS = ['D1', 'D2', 'D3'];

/**
 * 「不是欠账，只是换了说法」的 reason 特征。
 *
 * Angular 没有 Vue 的 props 式插槽/双向绑定，`modelValue`、`onChange`、`default`、`content`
 * 这类上游属性在本库是输出绑定、ng-content 或 (change) 事件，属于 API 形态差异而非未实现。
 * 这些条目照样要留在 ignoreUpstream（否则 missing 会误报），但不能算进深度债，
 * 否则 D 阶段的工作单会被大量零工作量条目稀释。
 */
const MAPPING_PATTERNS = [/^Angular (用|直接)/, /双向绑定/, /ng-content/, /插槽/, /Vue 的默认插槽/];

function isMapping(reason) {
  return MAPPING_PATTERNS.some((p) => p.test(reason ?? ''));
}

const LINE_TITLES = {
  D1: 'D1 表格与选择线',
  D2: 'D2 录入与反馈线',
  D3: 'D3 其余组件与边角能力',
};

function loadReport() {
  if (FROM) {
    return JSON.parse(fs.readFileSync(path.resolve(ROOT, FROM), 'utf8'));
  }

  const tmp = path.join(ROOT, '.local-cache', 'align-report.json');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  // 用文件描述符接 stdout，而不是管道：DSH 沙箱禁止父进程捕获子进程管道输出（spawn EPERM）。
  const fd = fs.openSync(tmp, 'w');
  try {
    execFileSync(process.execPath, [path.join(ROOT, 'scripts', 'align-check.mjs'), '--json'], {
      cwd: ROOT,
      stdio: ['ignore', fd, 'inherit'],
    });
  } finally {
    fs.closeSync(fd);
  }
  return JSON.parse(fs.readFileSync(tmp, 'utf8'));
}

function resolveBucket(className, reason) {
  const explicit = /^\s*\[(D[123])\]/i.exec(reason ?? '');
  if (explicit) {
    return { bucket: explicit[1].toUpperCase(), explicit: true };
  }
  for (const bucket of BUCKETS) {
    if ((LINE_DEFAULTS[bucket] ?? []).includes(className)) {
      return { bucket, explicit: false };
    }
  }
  return { bucket: 'D3', explicit: false };
}

function pct(part, total) {
  if (!total) return '—';
  return `${((part / total) * 100).toFixed(1)}%`;
}

function clip(text, max = 100) {
  const oneLine = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!oneLine) return '（未写原因）';
  return oneLine.length > max ? `${oneLine.slice(0, max - 1)}…` : oneLine;
}

function buildMarkdown(report) {
  const components = (report.components ?? []).filter((c) => c.status === 'ok' || c.status === 'drift');
  const lines = [];

  const rows = components
    .map((c) => {
      const upstreamIgnored = (c.ignored ?? []).filter((i) => i.inUpstream);
      const mappings = upstreamIgnored.filter((i) => isMapping(i.reason));
      const debts = upstreamIgnored
        .filter((i) => !isMapping(i.reason))
        .map((i) => ({ name: i.name, reason: i.reason, ...resolveBucket(c.className, i.reason) }));
      const counts = Object.fromEntries(BUCKETS.map((b) => [b, debts.filter((d) => d.bucket === b).length]));
      return {
        className: c.className,
        upstream: c.upstreamTotal ?? 0,
        aligned: c.aligned ?? 0,
        debts,
        mappings: mappings.length,
        counts,
        explicit: debts.filter((d) => d.explicit).length,
      };
    })
    .sort((a, b) => b.debts.length - a.debts.length || a.className.localeCompare(b.className));

  const totalDebt = rows.reduce((s, r) => s + r.debts.length, 0);
  const totalUpstream = report.totals?.upstreamProps ?? rows.reduce((s, r) => s + r.upstream, 0);
  const totalAligned = report.totals?.aligned ?? rows.reduce((s, r) => s + r.aligned, 0);
  const totalExplicit = rows.reduce((s, r) => s + r.explicit, 0);
  const totalMappings = rows.reduce((s, r) => s + r.mappings, 0);
  const bucketTotals = Object.fromEntries(
    BUCKETS.map((b) => [b, rows.reduce((s, r) => s + r.counts[b], 0)]),
  );

  lines.push('# 深度债报表（D 阶段工作单）');
  lines.push('');
  lines.push('> 由 `node scripts/depth-report.mjs` 生成，数据源 `scripts/align-check.mjs --json`，请勿手改。');
  lines.push('');
  lines.push(`- 上游版本：\`tdesign-vue-next@${report.upstreamVersion ?? '?'}\``);
  lines.push(`- 组件：${rows.length} 个（仅统计有上游对照的组件）`);
  lines.push(
    `- 上游属性：${totalUpstream}，已对齐 ${totalAligned}（${pct(totalAligned, totalUpstream)}）`,
  );
  lines.push(
    `- 深度债口径：未实现 ${totalUpstream - totalAligned} 项里，${totalMappings} 项是 Angular 惯用映射` +
      `（插槽 / 双向绑定 / 事件名），真实欠账 **${totalDebt}** 项`,
  );
  lines.push(
    `- 债务标注：显式带 \`[D#]\` 前缀 ${totalExplicit} 项，按组件默认归属 ${totalDebt - totalExplicit} 项`,
  );
  lines.push('');

  lines.push('## 1. 债务分布');
  lines.push('');
  lines.push('| 深度线 | 内容 | 债务数 | 占全部债务 |');
  lines.push('| --- | --- | ---: | ---: |');
  for (const b of BUCKETS) {
    lines.push(`| ${b} | ${LINE_TITLES[b]} | ${bucketTotals[b]} | ${pct(bucketTotals[b], totalDebt)} |`);
  }
  lines.push(`| — | **合计** | **${totalDebt}** | 100% |`);
  lines.push('');

  lines.push('## 2. 组件债务表（按债务降序）');
  lines.push('');
  lines.push('| 组件 | 上游 | 已对齐 | 覆盖率 | D1 | D2 | D3 | 显式标注 |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');
  for (const r of rows) {
    if (r.debts.length === 0) continue;
    lines.push(
      `| \`${r.className}\` | ${r.upstream} | ${r.aligned} | ${pct(r.aligned, r.upstream)} | ` +
        `${r.counts.D1} | ${r.counts.D2} | ${r.counts.D3} | ${r.explicit}/${r.debts.length} |`,
    );
  }
  const clean = rows.filter((r) => r.debts.length === 0).map((r) => `\`${r.className}\``);
  lines.push('');
  lines.push(
    clean.length
      ? `已无深度债的组件：${clean.join('、')}。`
      : '当前没有无债组件。',
  );
  lines.push('');

  lines.push('## 3. 债务明细');
  lines.push('');
  for (const r of rows) {
    if (r.debts.length === 0) continue;
    const head = BUCKETS.filter((b) => r.counts[b])
      .map((b) => `${b} ${r.counts[b]}`)
      .join(' / ');
    lines.push(`### \`${r.className}\` — ${r.debts.length} 项（${head}）`);
    lines.push('');
    for (const b of BUCKETS) {
      const group = r.debts.filter((d) => d.bucket === b);
      if (group.length === 0) continue;
      lines.push(`**${b}**`);
      lines.push('');
      for (const d of group) {
        lines.push(`- \`${d.name}\`${d.explicit ? '' : '（继承）'}：${clip(d.reason)}`);
      }
      lines.push('');
    }
  }

  return `${lines.join('\n')}\n`;
}

function main() {
  const report = loadReport();
  const markdown = buildMarkdown(report);
  if (OUT) {
    const target = path.resolve(ROOT, OUT);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, markdown, 'utf8');
    const debt = (markdown.match(/^### /gm) ?? []).length;
    console.log(`已写入 ${path.relative(ROOT, target)}（${debt} 个有债组件）`);
    return;
  }
  process.stdout.write(markdown);
}

main();
