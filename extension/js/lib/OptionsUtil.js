import * as TimerUtil from './TimerUtil.js';
import * as Urls from './Urls.js';

export function save() {
  Promise.resolve()
    .then(() => {
      let el = /** @type {HTMLTextAreaElement} */ (document.getElementById(
        'js-input-urls',
      ));
      let urlsAsText = el.value;
      return Urls.saveText(urlsAsText);
    })
    .then(() => {
      return this.restore();
    })
    .then(() => {
      document.getElementById('js-status').textContent = 'Options saved.';
    })
    .then(() => {
      return TimerUtil.setTimeout(2000);
    })
    .then(() => {
      document.getElementById('js-status').textContent = '';
    });
}

export function restore() {
  return Promise.resolve()
    .then(() => {
      return Urls.load();
    })
    .then((urls) => {
      let el = /** @type {HTMLTextAreaElement} */ (document.getElementById(
        'js-input-urls',
      ));
      el.value = Urls.stringify(urls);
    });
}
