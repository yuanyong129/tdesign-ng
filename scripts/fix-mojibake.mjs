/**
 * Repair "UTF-8 bytes decoded as GBK" mojibake in repository text files.
 *
 * The legacy Arco port stored Chinese comments that had been round-tripped
 * through GBK: original UTF-8 bytes -> decoded as GBK (which produces mojibake)
 * -> saved back as UTF-8. This script reverses the damage with no dependency by
 * building a GBK -> character table from the platform ICU decoder and inverting
 * it into an encoder.
 *
 * Repairs are applied per contiguous non-ASCII run and every candidate is
 * verified by re-running the corruption and comparing against the run it came
 * from, so a file can never be made worse. Lone `?` characters (bytes that were
 * already destroyed upstream) simply split a run and stay untouched.
 *
 * Usage: node scripts/fix-mojibake.mjs [--write]
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');
const TARGET_EXT = new Set(['.ts', '.less', '.js', '.json', '.html', '.md', '.scss', '.css', '.yaml', '.yml']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.angular', 'out-tsc']);

const gbkDecoder = new TextDecoder('gbk', { fatal: true });
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
const utf8Encoder = new TextEncoder();

/** char -> [byte, byte] for double byte GBK, plus the GBK single byte extensions. */
const CHAR_TO_BYTES = new Map();
for (let b1 = 0x81; b1 <= 0xfe; b1++) {
  for (let b2 = 0x40; b2 <= 0xfe; b2++) {
    let ch;
    try {
      ch = gbkDecoder.decode(Uint8Array.of(b1, b2));
    } catch {
      continue;
    }
    if (ch.length === 1 && !CHAR_TO_BYTES.has(ch)) CHAR_TO_BYTES.set(ch, [b1, b2]);
  }
}
// GBK/CP936 maps a few single bytes (notably 0x80 -> '€') to characters.
for (let b = 0x80; b <= 0xff; b++) {
  let ch;
  try {
    ch = gbkDecoder.decode(Uint8Array.of(b));
  } catch {
    continue;
  }
  if (ch.length === 1 && !CHAR_TO_BYTES.has(ch)) CHAR_TO_BYTES.set(ch, [b]);
}

/** Encode a string back to the GBK byte stream it was decoded from. */
function gbkEncode(text) {
  const bytes = [];
  for (const ch of text) {
    const pair = CHAR_TO_BYTES.get(ch);
    if (!pair) return null;
    bytes.push(pair[0], pair[1]);
  }
  return Uint8Array.from(bytes);
}

function decodeUtf8(bytes) {
  try {
    return utf8Decoder.decode(bytes);
  } catch {
    return null;
  }
}

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

/** Repair every repairable non-ASCII run inside a text blob. */
function repair(text) {
  let fixed = 0;
  const out = text.replace(/[^\x00-\x7F]+/g, (run) => {
    const bytes = gbkEncode(run);
    if (!bytes) return run;
    const decoded = decodeUtf8(bytes);
    if (!decoded || decoded === run) return run;
    let recorrupted;
    try {
      recorrupted = gbkDecoder.decode(utf8Encoder.encode(decoded));
    } catch {
      return run;
    }
    if (recorrupted !== run) return run;
    fixed++;
    return decoded;
  });
  return { out, fixed };
}

let repaired = 0;
const report = [];

for (const file of walk(ROOT)) {
  const original = readFileSync(file, 'utf8');
  const { out, fixed } = repair(original);
  if (fixed === 0 || out === original) continue;
  repaired++;
  report.push(`${relative(ROOT, file)} (${fixed} run${fixed > 1 ? 's' : ''})`);
  if (WRITE) writeFileSync(file, out);
}

console.log(`${WRITE ? 'rewrote' : 'would rewrite'} ${repaired} file(s)`);
for (const f of report) console.log('  ', f);
