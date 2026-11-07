// Đóng gói mây 3D của template thành file tĩnh trong clouds/. Cần thư mục ../quangcaongocan đã `npm ci`.
// Chạy: node tools/build-clouds.mjs
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TPL = path.resolve(ROOT, '../quangcaongocan');
const esbuild = (await import(path.join(TPL, 'node_modules/esbuild/lib/main.js'))).default;
const OUT = path.join(ROOT, 'clouds');

fs.rmSync(OUT, { recursive: true, force: true });
await esbuild.build({
  entryPoints: { sky: path.join(ROOT, 'tools/sky.ts') },
  outdir: OUT,
  bundle: true,
  splitting: true, // three.js tách thành file riêng, chỉ tải khi máy có GPU
  format: 'esm',
  minify: true,
  target: 'es2020',
  chunkNames: '[name]-[hash]',
  plugins: [{
    // `import x from './a.png?url'` (cú pháp Vite): chép ảnh vào clouds/, URL tính theo vị trí file JS
    name: 'vite-url',
    setup(b) {
      b.onResolve({ filter: /\?url$/ }, (a) => ({ path: path.resolve(a.resolveDir, a.path.slice(0, -4)), namespace: 'url' }));
      b.onLoad({ filter: /.*/, namespace: 'url' }, (a) => {
        const name = path.basename(a.path);
        fs.mkdirSync(OUT, { recursive: true });
        fs.copyFileSync(a.path, path.join(OUT, name));
        return { contents: `export default new URL(${JSON.stringify('./' + name)}, import.meta.url).href;`, loader: 'js' };
      });
    },
  }],
  logLevel: 'info',
});
fs.copyFileSync(path.join(TPL, 'apps/web/src/assets/clouds/LICENSE'), path.join(OUT, 'LICENSE-cloud.txt'));
