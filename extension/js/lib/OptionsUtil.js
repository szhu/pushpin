import * as TimerUtil from './TimerUtil.js';
import * as Urls from './Urls.js';
import { $ } from './QuerySelectorUtil.js';

export const Elements = {
  InputUrls: /** @type {HTMLTextAreaElement} */ ($('#js-input-urls')),
  Status: /** @type {HTMLElement} */ ($('#js-status')),
  Submit: /** @type {HTMLElement} */ ($('#js-submit')),
};

export async function save() {
  let urlsAsText = Elements.InputUrls.value;
  await Urls.saveText(urlsAsText);
  this.restore();
  Elements.Status.textContent = 'Options saved.';
  await TimerUtil.setTimeout(2000);
  Elements.Status.textContent = '';
}

export async function restore() {
  const urls = await Urls.load();
  Elements.InputUrls.value = Urls.stringify(urls);
}

export async function maximizeDocumentElementHeight() {
  document.documentElement.style.minHeight = '1000px';
  await TimerUtil.pollUntil(10, () => window.innerHeight > 100);
  await TimerUtil.setTimeout(200);
  document.documentElement.style.minHeight = '100vh';
}
