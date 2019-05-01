import * as DomUtil from './lib/DomUtil.js';
import * as Options from './lib/OptionsUtil.js';
import * as TimerUtil from './lib/TimerUtil.js';

Promise.resolve(() => {
  return DomUtil.Ready;
})
  .then(() => {
    return Options.restore();
  })
  .then(() => {
    document.getElementById('js-submit').addEventListener('click', () => {
      Options.save();
    });
  });

Promise.resolve(() => {
  return DomUtil.Ready;
})
  .then(() => {
    document.documentElement.style.minHeight = '1000px';
  })
  .then(() => {
    return TimerUtil.pollUntil(10, () => {
      return window.innerHeight > 100;
    });
  })
  .then(() => {
    return TimerUtil.setTimeout(200);
  })
  .then(() => {
    document.documentElement.style.minHeight = '100vh';
  });
