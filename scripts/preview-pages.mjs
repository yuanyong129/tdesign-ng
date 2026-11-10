/**
 * 本地预览 GitHub Pages 产物。
 *
 * 复现 Pages 的路径行为：
 *   - 站点根路径是 /tdesign-ng/（与 angular.json 的 baseHref 一致）
 *   - 未知路径回退到 index.html（对应部署时复制的 404.html）
 *
 * 用法：pnpm run build:docs && node scripts/preview-pages.mjs
 */
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const ROOT = 'packages/docs/dist/docs/browser';
const BASE = '/tdesign-ng/';
const PORT = Number(process.argv[2] ?? 4281);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

if (!existsSync(join(ROOT, 'index.html'))) {
  console.error(`找不到 ${ROOT}/index.html，请先执行 pnpm run build:docs`);
  process.exit(1);
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host}`);

  if (!url.pathname.startsWith(BASE)) {
    response.writeHead(302, { location: BASE });
    response.end();
    return;
  }

  const relative = normalize(url.pathname.slice(BASE.length)).replace(/^([.]{2}[/\\])+/, '');
  let filePath = join(ROOT, relative);

  // 目录或未知路径 → index.html（模拟 404.html 回退）
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(ROOT, 'index.html');
  }

  const body = readFileSync(filePath);
  response.writeHead(200, { 'content-type': MIME[extname(filePath)] ?? 'application/octet-stream' });
  response.end(body);
});

server.listen(PORT, () => {
  console.log(`Pages 预览：http://127.0.0.1:${PORT}${BASE}`);
});
