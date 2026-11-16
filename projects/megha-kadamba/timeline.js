// One timeline drives picture, lyrics and checks. Downbeats measured from the song (librosa beat track, 117.5 BPM).
export const DUR = 32.21, FPS = 30, W = 1080, H = 1920;
export const DB = [1.86, 3.87, 5.87, 7.87, 9.85, 11.85, 13.84, 15.88, 17.86, 19.85, 21.85, 23.85, 25.87, 27.86, 29.86, 31.76];
export const BEATS = [1.86, 2.37, 2.86, 3.37, 3.88, 4.37, 4.85, 5.36, 5.87, 6.36, 6.90, 7.36, 7.87, 8.36, 8.85, 9.36, 9.85, 10.36, 10.84, 11.35, 11.84, 12.35, 12.84, 13.35, 13.84, 14.35, 14.86, 15.35, 15.88, 16.37, 16.86, 17.35, 17.86, 18.37, 18.85, 19.34, 19.85, 20.36, 20.85, 21.34, 21.85, 22.34, 22.87, 23.36, 23.85, 24.36, 24.85, 25.36, 25.87, 26.35, 26.87, 27.35, 27.86, 28.35, 28.86, 29.35, 29.86, 30.35, 30.86, 31.35, 31.76];
// shared warm palette (all three styles)
export const PAL = { alta: '#C8321E', mari: '#E8962C', gold: '#F2B83E', cream: '#F4E4C8', plum: '#2A1418', cool: '#5A6E8C' };
// sections: style per shot
export const SHOTS = [
  { id: 1, t0: 0.00, t1: 3.87, style: 'lightbox', name: 'Sun-hole · her adornment' },
  { id: 2, t0: 3.87, t1: 7.87, style: 'lightbox', name: 'Konark wheel' },
  { id: 3, t0: 7.87, t1: 11.85, style: 'watercolor', name: 'Alta feet · mandar burst' },
  { id: 4, t0: 11.85, t1: 15.88, style: 'watercolor', name: 'Phagun flame-tree' },
  { id: 5, t0: 15.88, t1: 19.85, style: 'impasto', name: 'Monsoon kadamba' },
  { id: 6, t0: 19.85, t1: 23.85, style: 'impasto', name: 'Rain · vermilion umbrella' },
  { id: 7, t0: 23.85, t1: 27.86, style: 'impasto', name: 'Kadamba macro' },
  { id: 8, t0: 27.86, t1: 32.21, style: 'impasto', name: 'Blossom becomes the wheel' },
];
// lyrics: two rows each (split at the comma), on the two-bar grid
export const LYR = [
  { t0: 0.20, t1: 3.80, a: 'ରୂପର ତୋ ଶୃଙ୍ଗାର,', b: 'କରୁଛି ଅଧୀର' },
  { t0: 3.90, t1: 7.80, a: 'ତୁ କେଉଁ କୋଣାର୍କ,', b: 'ମୁଁ ଜାଣିପାରେନା' },
  { t0: 7.90, t1: 11.75, a: 'ଅଳତା ତୁ ନାଇଲେ,', b: 'ପୃଥିବୀ ମନ୍ଦାର' },
  { t0: 11.85, t1: 15.70, a: 'ତୁ କେଉଁ ଫଗୁଣଟେ,', b: 'ବୁଝିହୁଏନା' },
  { t0: 15.90, t1: 19.80, a: 'ଆଲୋ ମୋର', b: 'ମେଘ କଦମ୍ବ' },
  { t0: 19.90, t1: 23.80, a: 'ବଢ଼ାନି ମୋ', b: 'ମନ ବେଗ' },
  { t0: 23.90, t1: 27.80, a: 'ଆଲୋ ମୋର', b: 'ମେଘ କଦମ୍ବ' },
  { t0: 27.90, t1: 32.00, a: 'ଓ ଓ ଓ...', b: '' },
];
