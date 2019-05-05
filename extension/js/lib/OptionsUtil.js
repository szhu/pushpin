import * as TimerUtil from "./TimerUtil.js";
import * as Urls from "./Urls.js";
import { $ } from "./QuerySelectorUtil.js";

export const Elements = {
  InputUrls: /** @type {HTMLTextAreaElement} */ ($("#js-input-urls")),
  Status: /** @type {HTMLElement} */ ($("#js-status")),
  Submit: /** @type {HTMLElement} */ ($("#js-submit")),
};

/**
 * @param {string} status
 * @param {number} ms
 */
async function flashStatus(status, ms) {
  Elements.Status.textContent = status;
  await TimerUtil.setTimeout(ms);
  Elements.Status.textContent = "";
}

export async function restore() {
  const urls = await Urls.load();
  Elements.InputUrls.value = Urls.stringify(urls);
}

export async function save() {
  await Urls.saveText(Elements.InputUrls.value);

  // Usually should be a no-op. But if something is wrong with saving or
  // loading, this line should result in a similar failure and hint to the user
  // that something is wrong.
  Elements.InputUrls.value = "(Error saving or loading!)";
  restore();

  flashStatus("Options saved.", 2000);
}

/**
 * The browser continuously resizes the viewport of the options page depending
 * on whether there is vertical content overflow. So, in order to get as much
 * height as possible, we request a lot of height, wait for the viewport to be
 * expanded, then set 100vh so that we keep it at the same height but remove any
 * scrollbars.
 */
export async function maximizeDocumentElementHeight() {
  document.documentElement.style.minHeight = "1000px";
  await TimerUtil.pollUntil(10, () => window.innerHeight > 100);
  await TimerUtil.setTimeout(200);
  document.documentElement.style.minHeight = "100vh";
}
