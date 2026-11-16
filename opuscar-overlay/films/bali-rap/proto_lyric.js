import { drawLyric } from './lyrics.js';
const QS = new URLSearchParams(location.search);
const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; document.getElementById('stage').appendChild(cv); const g = cv.getContext('2d');
for (const f of ['700 40px "Anek Odia"', '300 30px "Inter Tight"']) await document.fonts.load(f, 'ଅA');
const img = new Image(); img.src = 'stills/' + QS.get('img'); await img.decode();
window.render = () => { g.drawImage(img, 0, 0, 1080, 1920); drawLyric(g, +QS.get('i'), 2.0, QS.get('look') || 'light', QS.get('zone') || 'low'); };
window.DUR = 1; window.render(); window.READY = true;
