import path from 'path';
import fs from 'fs';

const PORT = Number(process.env.PORT) || 3000;
const REPO_ROOT = path.resolve(import.meta.dir, '../..');

async function buildPreview() {
  const result = await Bun.build({
    entrypoints: [path.resolve(import.meta.dir, 'preview.jsx')],
    minify: false,
    sourcemap: 'inline',
  });
  if (!result.success) {
    console.error('[Preview] Build failed:', result.logs);
    return null;
  }
  return await result.outputs[0].text();
}

// Initial bundle build
let bundleContent = await buildPreview();

let tokensCss = '';
let baseCss = '';
try {
  tokensCss = fs.readFileSync(path.resolve(REPO_ROOT, 'rewampui-components/shared/tokens.css'), 'utf-8');
  baseCss = fs.readFileSync(path.resolve(REPO_ROOT, 'rewampui-components/shared/base.css'), 'utf-8');
} catch (e) {
  console.warn('[Preview] Could not load shared CSS:', e.message);
}

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Holo UI - 3D 卡片组件本地验收预览</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${tokensCss}
    ${baseCss}
  </style>
</head>
<body class="bg-neutral-950 text-neutral-100 min-h-screen">
  <div id="root"></div>
  <script type="module" src="/preview.js"></script>
</body>
</html>`;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    if (url.pathname === '/preview.js') {
      const freshBundle = await buildPreview();
      return new Response(freshBundle || bundleContent, {
        headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
      });
    }
    return new Response('Not found', { status: 404 });
  },
});

console.log('\n' + '='.repeat(52));
console.log('✨ Holo UI 3D 卡片本地验收预览服务已就绪:');
console.log(`👉 http://localhost:${server.port}`);
console.log('可直接在浏览器中打开以上链接查看并交互验收。');
console.log('按 Ctrl + C 可随时退出服务。');
console.log('='.repeat(52) + '\n');
