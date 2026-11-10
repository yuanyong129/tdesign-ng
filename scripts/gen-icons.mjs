#!/usr/bin/env node
/**
 * 从 tdesign-icons-svg 生成图标注册表。
 *
 * 上游 t-icon 是「动态 name」组件：<t-icon name="add" />。Angular 侧同样以 name 驱动，
 * 图标数据编译进注册表，运行时按 name 解析成 SVG 片段。
 *
 * 用法：
 *   node scripts/gen-icons.mjs                # 生成内置 curated 子集
 *   node scripts/gen-icons.mjs --all          # 生成上游全量图标（约 2300+）
 *   node scripts/gen-icons.mjs --check        # 仅校验产物是否为最新
 *   node scripts/gen-icons.mjs --from <dir>   # 从已解压的图标目录读取（离线）
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = join(ROOT, 'packages/icons/src/icons.generated.ts');
const DEFAULT_SOURCE = join(ROOT, '.local-cache/icons-extract/package/src');
const TARBALL = join(ROOT, '.local-cache/tdesign-icons-svg.tgz');
const ICON_VERSION = '0.4.8';
const NPM_URL = `https://registry.npmjs.org/tdesign-icons-svg/-/tdesign-icons-svg-${ICON_VERSION}.tgz`;

/**
 * 组件库自身与文档示例会用到的图标。全量图标请用 --all 生成。
 * 缺名会直接报错，避免上游改名后静默丢图标。
 */
const CURATED = [
  'loading',
  'add',
  'plus',
  'minus',
  'close',
  'check',
  'check-circle',
  'check-circle-filled',
  'close-circle',
  'close-circle-filled',
  'error-circle',
  'error-circle-filled',
  'info-circle',
  'info-circle-filled',
  'help-circle',
  'help-circle-filled',
  'chevron-down',
  'chevron-up',
  'chevron-left',
  'chevron-right',
  'arrow-down',
  'arrow-up',
  'arrow-left',
  'arrow-right',
  'search',
  'delete',
  'edit',
  'download',
  'upload',
  'refresh',
  'star',
  'star-filled',
  'heart',
  'heart-filled',
  'home',
  'user',
  'setting',
  'more',
  'ellipsis',
  'jump',
  'link',
  'menu',
  'filter',
  'calendar',
  'time',
  'mail',
  'call',
  'copy',
  'print',
  'share',
  'browse',
  'browse-off',
  'lock-on',
  'lock-off',
  'play',
  'pause',
  'stop',
  'image',
  'file',
  'folder',
  'location',
  'tag',
  'discount',
  'cart',
  'notification',
];

function parseArgs(argv) {
  const args = { all: false, check: false, from: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--all') args.all = true;
    else if (arg === '--check') args.check = true;
    else if (arg === '--from') args.from = argv[++i] ?? null;
    else if (arg.startsWith('--from=')) args.from = arg.slice('--from='.length);
    else if (arg === '--help' || arg === '-h') {
      console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]);
      process.exit(0);
    } else {
      throw new Error(`未知参数：${arg}`);
    }
  }
  return args;
}

function ensureSource() {
  if (existsSync(DEFAULT_SOURCE)) return DEFAULT_SOURCE;
  if (!existsSync(TARBALL)) {
    throw new Error(
      `找不到图标源：${DEFAULT_SOURCE}\n` +
        `请先下载 ${NPM_URL}\n` +
        `并解压到 .local-cache/icons-extract，或用 --from 指定图标目录。`,
    );
  }
  throw new Error(
    `压缩包存在但未解压：${TARBALL}\n` +
      `请执行：tar -xzf .local-cache/tdesign-icons-svg.tgz -C .local-cache/icons-extract`,
  );
}

/** 把上游 SVG 拆成 viewBox + 内部片段。上游把 viewBox 误写成 view-box，这里一并兼容。 */
function parseSvg(source, file) {
  const root = /<svg([^>]*)>([\s\S]*)<\/svg>/i.exec(source);
  if (!root) throw new Error(`无法解析 SVG：${file}`);

  const attrs = root[1];
  const inner = root[2].trim();
  const viewBox = /view-box="([^"]+)"/i.exec(attrs)?.[1] ?? /viewBox="([^"]+)"/i.exec(attrs)?.[1];
  if (!viewBox) throw new Error(`缺少 viewBox：${file}`);

  const content = inner
    .replace(/\s*\n\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { viewBox, content };
}

/** 生成 TS 字符串字面量。片段里可能出现反引号与 ${，必须转义。 */
function toLiteral(value) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function build() {
  const source = ensureSource();
  const files = readdirSync(source).filter((name) => name.endsWith('.svg')).sort();
  const available = new Map(files.map((name) => [name.slice(0, -4), name]));

  if (!args.all) {
    const missing = CURATED.filter((name) => !available.has(name));
    if (missing.length) {
      throw new Error(`内置图标列表里有 ${missing.length} 个名字在上游不存在：${missing.join(', ')}`);
    }
  }

  const names = args.all ? [...available.keys()].sort() : CURATED;
  const lines = [];
  const viewBoxes = new Set();

  for (const name of names) {
    const file = available.get(name);
    const svg = parseSvg(readFileSync(join(source, file), 'utf8'), file);
    viewBoxes.add(svg.viewBox);
    lines.push(`  ${toLiteral(name)}: { viewBox: ${toLiteral(svg.viewBox)}, content: ${toLiteral(svg.content)} },`);
  }

  const banner = [
    '// 此文件由 scripts/gen-icons.mjs 生成，请勿手改。',
    `// 图标来源：tdesign-icons-svg@${ICON_VERSION}`,
    `// 图标数量：${names.length}${args.all ? '（全量）' : '（内置子集，用 --all 生成全量）'}`,
    '',
    'export interface TDesignIconSource {',
    '  readonly viewBox: string;',
    '  readonly content: string;',
    '}',
    '',
    '/** 图标名 => SVG 片段。片段均为上游图标源码，不含用户输入。 */',
    'export const TD_ICONS: Record<string, TDesignIconSource> = {',
    ...lines,
    '};',
    '',
    '/** 已注册的图标名，按字母序。 */',
    `export const TD_ICON_NAMES: readonly string[] = [${names.map(toLiteral).join(', ')}];`,
    '',
  ].join('\n');

  return { banner, names, viewBoxes: [...viewBoxes].sort() };
}

function main() {
  args = parseArgs(process.argv.slice(2));
  const { banner, names, viewBoxes } = build();
  const previous = existsSync(TARGET) ? readFileSync(TARGET, 'utf8') : null;

  if (args.check) {
    if (previous !== banner) {
      console.error('✖ icons.generated.ts 与图标源不一致，请执行 pnpm gen:icons');
      process.exit(1);
    }
    console.log(`✔ 图标注册表已是最新（${names.length} 个）`);
    return;
  }

  mkdirSync(dirname(TARGET), { recursive: true });
  writeFileSync(TARGET, banner, 'utf8');

  console.log(
    `✔ 生成 ${names.length} 个图标 -> packages/icons/src/icons.generated.ts` +
      ` (${(Buffer.byteLength(banner) / 1024).toFixed(1)} KB, viewBox: ${viewBoxes.join(' | ')})`,
  );
}

let args;
main();
