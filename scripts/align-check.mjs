#!/usr/bin/env node
/**
 * 把本仓库组件的 API 与 tdesign-vue-next 的 props 定义做机器比对。
 *
 * 目的：P1 逐个重写组件时，靠人眼比文档一定会漏属性。这个脚本产出两个清单——
 *   missing：上游有、我们没有（要做的工作）
 *   extra  ：我们有、上游没有（多半是 Arco 遗留，要删）
 *
 * 数据来源是 tdesign-vue-next 发布包里的 `es/<component>/type.d.ts`，
 * 这是它的公开类型契约（比读源码 props.ts 更稳，不受内部实现影响）。
 *
 * 用法：
 *   node scripts/align-check.mjs              # 打印报告
 *   node scripts/align-check.mjs --strict     # 有任何 missing 就退出码 1（CI 用）
 *   node scripts/align-check.mjs --component TButton
 *   node scripts/align-check.mjs --json       # 输出结构化报告（供 depth-report 消费）
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { ANGULAR_EVENT_IGNORES as ANGULAR_EVENT_IGNORES_SHARED } from './align-check.config/shared.mjs';
import { loadAlignConfigs } from './align-check.config/index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
// API_FILE 允许指向会话自己的生成物（API_OUT 的产物）：并行开发时不会互相看到对方的中间状态，
// integrator 在合并后统一跑 gen:api 覆盖入库版本再校验。
const API_FILE = process.env.API_FILE
  ? path.resolve(ROOT, process.env.API_FILE)
  : path.join(ROOT, 'packages/docs/src/app/api/api.generated.json');
const CACHE_DIR = path.join(ROOT, '.local-cache/upstream');

/** 锁定的上游版本。升级时刻意为之，不跟随 latest，避免报告噪音。 */
const UPSTREAM_VERSION = '1.20.11';
const UPSTREAM_BASE = `https://unpkg.com/tdesign-vue-next@${UPSTREAM_VERSION}/es`;

/**
 * Angular 侧用 `(blur)` `(change)` 之类的输出代替 Vue 的 `onXxx` 回调，
 * 这类差异对所有组件都一样，集中说明一次。
 */
const ANGULAR_EVENT_IGNORES = ANGULAR_EVENT_IGNORES_SHARED;;

/**
 * 每个组件的对齐配置。
 * - upstream：上游组件目录名；为 null 表示 TDesign 没有对应组件（Arco 独有，P1 会删除）
 * - renames：上游属性名 -> 我们的输入属性名（语义等价但命名不同）
 * - angularOnly：我们有意多出来的输入属性（Angular 平台特性），不计入 extra
 * - ignoreUpstream：上游属性里我们决定不支持的部分（需写明理由）
 */
const CONFIG = await loadAlignConfigs();;

const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
const JSON_OUT = argv.includes('--json');
const ONLY = argv.includes('--component') ? argv[argv.indexOf('--component') + 1] : null;

/** 读取（并缓存）上游某个组件的 type.d.ts。 */
async function fetchUpstreamTypes(componentDir) {
  const cacheFile = path.join(CACHE_DIR, `${UPSTREAM_VERSION}-${componentDir}-type.d.ts`);
  try {
    return await fs.readFile(cacheFile, 'utf8');
  } catch {
    // 未缓存，走网络。
  }
  const url = `${UPSTREAM_BASE}/${componentDir}/type.d.ts`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`拉取失败 ${url}: HTTP ${res.status}`);
  const text = await res.text();
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cacheFile, text, 'utf8');
  return text;
}

/** 从 .d.ts 里解析出 props 接口的成员。 */
function parseProps(text, componentDir, interfaceName) {
  const source = ts.createSourceFile('type.d.ts', text, ts.ScriptTarget.Latest, true);
  const members = new Map();
  // 部分上游组件把单个与分组的 props 放在同一个 type.d.ts 里（如 checkbox、radio），
  // 这时必须按接口名精确取值，否则会把另一组件的属性算成 missing。
  const matches = (name) => (/^Td.*Props$/.test(name) ? !interfaceName || name === interfaceName : false);

  const collectFromTypeLiteral = (literal) => {
    for (const m of literal.members) {
      if (!ts.isPropertySignature(m) || !m.name) continue;
      const name = ts.isIdentifier(m.name) || ts.isStringLiteral(m.name) ? m.name.text : m.name.getText(source);
      members.set(name, {
        name,
        optional: !!m.questionToken,
        type: m.type?.getText(source) ?? 'any',
      });
    }
  };

  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      // 约定：props 接口名形如 TdXxxProps
      if (matches(node.name.text)) {
        for (const m of node.members) {
          if (!ts.isPropertySignature(m) || !m.name) continue;
          const name = ts.isIdentifier(m.name) || ts.isStringLiteral(m.name) ? m.name.text : m.name.getText(source);
          members.set(name, {
            name,
            optional: !!m.questionToken,
            type: m.type?.getText(source) ?? 'any',
          });
        }
      }
    }
    if (ts.isTypeAliasDeclaration(node) && matches(node.name.text) && ts.isTypeLiteralNode(node.type)) {
      collectFromTypeLiteral(node.type);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  if (!members.size) throw new Error(`${componentDir}/type.d.ts 里没找到 Td*Props 接口`);
  return members;
}

function formatList(names) {
  return names.length ? names.join(', ') : '—';
}

async function main() {
  const api = JSON.parse(await fs.readFile(API_FILE, 'utf8'));
  let totalMissing = 0;
  let totalExtra = 0;
  let totalUpstream = 0;
  let totalAligned = 0;
  const rows = [];
  const results = [];

  for (const [className, cfg] of Object.entries(CONFIG)) {
    if (ONLY && className !== ONLY) continue;
    const ours = api.components[className];
    if (!ours) {
      const note = 'API 数据里没有这个组件';
      rows.push({ className, status: 'skip', note });
      results.push({ className, status: 'skip', note });
      continue;
    }

    if (!cfg.upstream) {
      const note = cfg.reason ?? '上游没有对应组件';
      rows.push({ className, status: 'n/a', note });
      results.push({ className, status: 'n/a', note });
      continue;
    }

    let upstream;
    try {
      upstream = parseProps(await fetchUpstreamTypes(cfg.upstream), cfg.upstream, cfg.upstreamInterface);
    } catch (err) {
      rows.push({ className, status: 'error', note: err.message });
      results.push({ className, status: 'error', note: err.message });
      continue;
    }

    const ourNames = new Set(ours.inputs.map((i) => i.name));
    const renamedFrom = new Map(Object.entries(cfg.renames ?? {}));
    const angularOnly = new Set(cfg.angularOnly ?? []);
    const ignoreUpstream = cfg.ignoreUpstream ?? {};

    const missing = [];
    const present = [];
    for (const name of upstream.keys()) {
      if (name in ignoreUpstream) continue;
      const mapped = renamedFrom.get(name) ?? name;
      if (ourNames.has(mapped)) present.push(name);
      else missing.push(name);
    }

    const upstreamMapped = new Set(
      [...upstream.keys()].filter((n) => !(n in ignoreUpstream)).map((n) => renamedFrom.get(n) ?? n),
    );
    const extra = ours.inputs
      .map((i) => i.name)
      .filter((n) => !upstreamMapped.has(n) && !angularOnly.has(n));

    totalMissing += missing.length;
    totalExtra += extra.length;
    totalUpstream += upstream.size;
    totalAligned += present.length;

    results.push({
      className,
      upstream: cfg.upstream,
      status: missing.length || extra.length ? 'drift' : 'ok',
      upstreamTotal: upstream.size,
      aligned: present.length,
      missing,
      extra,
      // ignoreUpstream 是「已决策不实现」的清单，reason 里的 [D1]/[D2]/[D3] 前缀
      // 供 scripts/depth-report.mjs 做深度债分组。inUpstream 区分「真的是上游属性」
      // 与「插槽/事件名的映射说明」，只有前者算深度债。
      ignored: Object.entries(ignoreUpstream).map(([name, reason]) => ({
        name,
        reason,
        inUpstream: upstream.has(name),
      })),
    });

    if (JSON_OUT) continue;

    console.log(`\n${className}  (上游 ${cfg.upstream}@${UPSTREAM_VERSION})`);
    console.log(`  已对齐 ${present.length}/${upstream.size}`);
    console.log(`  missing (${missing.length}): ${formatList(missing)}`);
    console.log(`  extra   (${extra.length}): ${formatList(extra)}`);
    if (missing.length) {
      console.log('  missing 明细:');
      for (const name of missing) {
        const p = upstream.get(name);
        console.log(`    - ${name}${p.optional ? '?' : ''}: ${p.type.replace(/\s+/g, ' ').slice(0, 90)}`);
      }
    }
  }

  if (JSON_OUT) {
    console.log(
      JSON.stringify(
        {
          upstreamVersion: UPSTREAM_VERSION,
          generatedAt: new Date().toISOString(),
          totals: {
            components: results.filter((r) => r.status === 'ok' || r.status === 'drift').length,
            upstreamProps: totalUpstream,
            aligned: totalAligned,
            missing: totalMissing,
            extra: totalExtra,
          },
          components: results,
        },
        null,
        2,
      ),
    );
  } else {
    for (const row of rows) {
      console.log(`\n${row.className}: ${row.status} —— ${row.note}`);
    }

    console.log(`\n合计：missing ${totalMissing} 项，extra ${totalExtra} 项。`);
  }

  if (STRICT && totalMissing > 0) {
    console.error('\n--strict 失败：仍有未对齐的上游属性。');
    process.exit(1);
  }
}

await main();





