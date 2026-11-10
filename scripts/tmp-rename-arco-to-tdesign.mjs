// One-shot migration: rename Arco Design Angular remnants to TDesign Angular.
// Safe-by-construction: skips any file that is not valid UTF-8.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = process.cwd();
const TARGET_EXT = new Set(['.ts', '.less', '.js', '.json', '.html', '.md', '.scss', '.css']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.angular']);

// Ordered replacements: [from, to, globalRegex?]
const RULES = [
  // --- package names / import paths ---
  ['@arco-design/web-ng', '@tdesign-ng/components'],
  ['@arco-design/arco-ng-docs', '@tdesign-ng/docs'],
  ['@web-ng/index', '@tdesign-ng/components'],
  ['@web-ng/', '@tdesign-ng/components/'],
  ['../web-ng/src/', '../components/src/'],
  ['arco-design-ng-monorepo', 'tdesign-ng-monorepo'],
  ['arco-design-ng', 'tdesign-ng'],
  ['projects/components', '../components'],
  ['Arco Design Angular', 'TDesign Angular'],
  ['Arco Design', 'TDesign'],

  // --- class / token symbols (longest first) ---
  ['ArcoButtonGroupModule', 'TButtonGroupModule'],
  ['ArcoButtonGroup', 'TButtonGroup'],
  ['ArcoButtonModule', 'TButtonModule'],
  ['ArcoButton', 'TButton'],
  ['ArcoDividerModule', 'TDividerModule'],
  ['ArcoDivider', 'TDivider'],
  ['ArcoLinkModule', 'TLinkModule'],
  ['ArcoLink', 'TLink'],
  ['ArcoSpaceModule', 'TSpaceModule'],
  ['ArcoSpace', 'TSpace'],
  ['ArcoScrollbarModule', 'TScrollbarModule'],
  ['ArcoScrollbar', 'TScrollbar'],
  ['ARCO_BUTTON_GROUP_VALUE_ACCESSOR', 'T_BUTTON_GROUP_VALUE_ACCESSOR'],
  ['ARCO_BUTTON_GROUP', 'T_BUTTON_GROUP'],
  ['ArcoOptions', 'TDesignOptions'],

  // --- selectors (explicit component list only) ---
  ...['button-group', 'button', 'space', 'divider', 'link', 'scrollbar'].flatMap((name) => [
    [`'a-${name}'`, `'t-${name}'`],
    [`"a-${name}"`, `"t-${name}"`],
    [`<a-${name}`, `<t-${name}`],
    [`</a-${name}`, `</t-${name}`],
    [`&lt;a-${name}`, `&lt;t-${name}`],
  ]),
];

// less variable plumbing: @prefix must become bare `t` (runtime getPrefixCls -> `t-btn`)
const LESS_SPECIFIC = [
  ['@prefix: arco;', '@prefix: t;'],
];

const countRef = { total: 0 };

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) walk(abs, out);
    else if (TARGET_EXT.has(extname(entry))) out.push(abs);
  }
  return out;
}

const decoder = new TextDecoder('utf-8', { fatal: true });
const encoder = new TextEncoder();
const report = [];

for (const file of walk(join(ROOT, 'packages'))) {
  const buf = readFileSync(file);
  let text;
  try {
    text = decoder.decode(buf);
  } catch {
    report.push({ file: relative(ROOT, file), changes: 0, note: 'SKIPPED (not valid UTF-8)' });
    continue;
  }
  const before = text;
  for (const [from, to] of LESS_SPECIFIC) text = text.split(from).join(to);
  for (const [from, to] of RULES) text = text.split(from).join(to);

  if (text !== before) {
    // count changed lines
    const a = before.split('\n');
    const b = text.split('\n');
    let changes = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) changes++;
    writeFileSync(file, encoder.encode(text));
    countRef.total += changes;
    report.push({ file: relative(ROOT, file), changes });
  }
}

report.sort((x, y) => y.changes - x.changes);
for (const r of report) console.log(String(r.changes).padStart(4), r.file, r.note ?? '');
console.log('total changed lines:', countRef.total, 'files touched:', report.filter(r => r.changes).length);
