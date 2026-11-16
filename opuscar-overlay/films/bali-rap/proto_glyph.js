const QS = new URLSearchParams(location.search);
const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1920; document.getElementById('stage').appendChild(cv); const c = cv.getContext('2d');
const WORDS = ['ବାଲିଯାତ୍ରା', 'କଟକ', 'ଓଡ଼ିଶାର', 'ପ୍ରାଣ', 'ଶୁଏ?', 'ମେଳା'];
await document.fonts.load('600 200px "Baloo Bhaina 2"');
window.render = () => { c.fillStyle = '#000'; c.fillRect(0, 0, 1080, 1920); c.fillStyle = '#fff'; c.textBaseline = 'alphabetic';
  WORDS.forEach((w, i) => { c.font = `600 ${i === 0 ? 190 : 220}px "Baloo Bhaina 2"`; c.fillText(w, 30, 260 + i * 310); }); };
window.DUR = 1; window.render(); window.READY = true;
