import * as ChromeApiUtil from './ChromeApiUtil.js';

const Chrome = ChromeApiUtil.getPromiseVersions([
  'chrome.storage.sync.get',
  'chrome.storage.sync.set',
]);

export function stringify(urls) {
  return urls.map((url) => `${url}\n`).join('');
}

export function parse(urlsAsText) {
  // Filter out blank lines
  return urlsAsText.split('\n').filter((line) => line);
}

export function normalize(urlsAsText) {
  return this.stringify(this.parse(urlsAsText));
}

export function saveText(urlsAsText) {
  return Promise.resolve().then(() => {
    return Chrome.storage.sync.set({
      urls: this.normalize(urlsAsText),
    });
  });
}

export function load() {
  return Promise.resolve()
    .then(() => {
      return Chrome.storage.sync.get({
        urls: '',
      });
    })
    .then(({ urls }) => {
      return this.parse(urls);
    });
}
