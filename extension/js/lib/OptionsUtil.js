import * as TimerUtil from './TimerUtil.js';
import * as Urls from './Urls.js';
import { $ } from './QuerySelectorUtil.js';

export const Elements = {
  InputUrls: /** @type {HTMLTextAreaElement} */ ($('#js-input-urls')),
  Status: /** @type {HTMLElement} */ ($('#js-status')),
  Submit: /** @type {HTMLElement} */ ($('#js-submit')),
};

export function save() {
  Promise.resolve()
    .then(() => {
      let urlsAsText = Elements.InputUrls.value;
      return Urls.saveText(urlsAsText);
    })
    .then(() => {
      return this.restore();
    })
    .then(() => {
      Elements.Status.textContent = 'Options saved.';
    })
    .then(() => {
      return TimerUtil.setTimeout(2000);
    })
    .then(() => {
      Elements.Status.textContent = '';
    });
}

export function restore() {
  return Promise.resolve()
    .then(() => {
      return Urls.load();
    })
    .then((urls) => {
      Elements.InputUrls.value = Urls.stringify(urls);
    });
}
