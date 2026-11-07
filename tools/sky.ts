// Mây 3D: dùng nguyên component mây của template quangcaongocan
// (apps/web/src/scripts/clouds.ts + cloud-sky.ts), vòng lặp vẽ chép từ components/Clouds.astro,
// bỏ GSAP/ScrollTrigger vì trang chỉ có một màn hình. Build: node tools/build-clouds.mjs
import { createClouds, type CloudSky } from '../../quangcaongocan/apps/web/src/scripts/clouds';

const SLOW = 1 / 40; // s/khung hình trung bình: coi là GPU không theo kịp, giảm số điểm ảnh

const canvas = document.querySelector<HTMLCanvasElement>('[data-clouds]');
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

// three.js nặng, nên chỉ tải khi trang đã load xong, font đã vẽ và trình duyệt rảnh.
const loaded = () =>
  new Promise<void>((r) => (document.readyState === 'complete' ? r() : addEventListener('load', () => r(), { once: true })));
const painted = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const idle = () => new Promise<void>((r) => ('requestIdleCallback' in window ? requestIdleCallback(() => r()) : setTimeout(r)));

if (canvas) {
  loaded()
    .then(() => document.fonts.ready)
    .then(painted)
    .then(idle)
    .then(() =>
      createClouds(canvas, {
        lit: token('--cloud-lit'),
        shade: token('--cloud-shade'),
        base: token('--cloud-base'),
        haze: token('--sky-4'),
      }),
    )
    .catch(() => undefined)
    .then((sky) => sky && run(sky));
}

function run(sky: CloudSky) {
  sky.resize();
  sky.draw(0);
  sky.canvas.dataset.ready = '';
  new ResizeObserver(() => {
    sky.resize();
    sky.draw(0);
  }).observe(sky.canvas);

  let frame = 0;
  let last: number | undefined;
  let slow = 0;
  let warm = 30;
  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (last === undefined) {
      last = now;
      return;
    }
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    slow += (dt - slow) * 0.05;
    if (warm > 0) warm--;
    else if (slow > SLOW && sky.degrade()) slow = 0;
    sky.draw(dt);
  };
  // Dừng khi tab ẩn hoặc người dùng bật giảm chuyển động (mây đứng yên).
  const sync = () => {
    cancelAnimationFrame(frame);
    last = undefined;
    if (!document.hidden && !reduce.matches) frame = requestAnimationFrame(tick);
  };
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  sync();
}
