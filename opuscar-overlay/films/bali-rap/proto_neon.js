import { makeNeon } from './neon.js';
const QS = new URLSearchParams(location.search), W = 1080, H = 1920;
const cv = document.createElement('canvas'); cv.width = W; cv.height = H; document.getElementById('stage').appendChild(cv);
const N = await makeNeon(cv, W, H);
const shot = QS.get('shot') || 'all';
window.render = t => {
  if (shot === 'all') N.render(t, N.cam(7, 4.99, 460, 1.4), { lights: 1, beat: 0, on: { od: [99], heart: [99] } });
  if (shot === 'prana') N.render(t, N.cam(13.2, 5.0, 520, 1.4), { lights: 1, beat: 0 });
  if (shot === 'street') N.render(t, N.cam(5.5, .5, 175, .6), { lights: 1, beat: 0 });
  if (shot === 'sleep') N.render(t, N.cam(0, 5.45, 540, 1.4), { lights: 0, on: { bj: [99], bjf: [99], od: [99], heart: [99], rd0: [99], rd1: [99], rdLeg: [99], kat: [0], moon: [0], zzz: [0] } });
};
window.DUR = 1; window.render(+(QS.get('t') ?? 1)); window.READY = true;
