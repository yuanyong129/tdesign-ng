import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));

function configFiles() {
  return readdirSync(DIR)
    .filter((name) => name.endsWith('.mjs') && name !== 'index.mjs' && name !== 'shared.mjs')
    .sort();
}

/**
 * 读取 scripts/align-check.config/ 下每个 <Component>.mjs，聚合成 align-check 的 CONFIG。
 *
 * 为什么要拆：每个组件的对齐配置各自一个文件。多个会话并行做深度对齐时，
 * 各自只改自己的 `<Component>.mjs`，不会在同一个大对象里产生 git 冲突。
 * 约定：一个文件只放一个组件；文件名 = 组件类名（如 TTable.mjs）。
 */
export async function loadAlignConfigs() {
  const config = {};
  for (const file of configFiles()) {
    const mod = await import(pathToFileURL(join(DIR, file)).href);
    const name = file.slice(0, -4);
    if (!mod.default) throw new Error(`align-check.config/${file} 缺少 export default`);
    if (config[name]) throw new Error(`align-check.config 出现重复组件：${name}`);
    config[name] = mod.default;
  }
  return config;
}

/** 已登记的组件名（按字母序）。 */
export function configComponentNames() {
  return configFiles().map((name) => name.slice(0, -4));
}
