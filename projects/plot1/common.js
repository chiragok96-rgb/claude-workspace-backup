export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = x => { x = clamp(x); return x * x * (3 - 2 * x); }, eo = x => 1 - Math.pow(1 - clamp(x), 3), eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const hh = n => { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); };
export const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
