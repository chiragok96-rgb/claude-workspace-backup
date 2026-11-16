import { initDawn, drawDawn } from './dawn.js';
const QS = new URLSearchParams(location.search);
const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; document.getElementById('stage').appendChild(cv); const c = cv.getContext('2d');
await initDawn();
window.render = t => drawDawn(c, t, { paint: 1, boita: +(QS.get('boita') ?? 0) });
window.DUR = 1; window.render(1); window.READY = true;
