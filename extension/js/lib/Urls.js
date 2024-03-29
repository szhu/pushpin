import * as ChromeApiUtil from "./ChromeApiUtil.js";

const Chrome = ChromeApiUtil.getPromiseVersions([
  "chrome.storage.sync.get",
  "chrome.storage.sync.set",
]);

/**
 * @param {string[]} urls
 * @returns {string}
 */
export function stringify(urls) {
  return urls.map((url) => `${url}\n`).join("");
}

/**
 * @param {string} urlsAsText
 * @returns {string[]}
 */
export function parse(urlsAsText) {
  // Filter out blank lines
  return urlsAsText.split("\n").filter(Boolean);
}

/**
 * @param {string} urlsAsText
 * @returns {string}
 */
export function normalize(urlsAsText) {
  return stringify(parse(urlsAsText));
}

/**
 * @param {string} urlsAsText
 * @returns {Promise<void>}
 */
export async function saveText(urlsAsText) {
  await Chrome.storage.sync.set({ urls: normalize(urlsAsText) });
}

/** @returns {Promise<string[]>} */
export async function load() {
  const { urls } = await Chrome.storage.sync.get({ urls: "" });
  return parse(urls);
}
