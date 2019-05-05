/**
 * Alias for document.querySelector.
 *
 * @param {string} selector
 */
export function $(selector) {
  return document.querySelector(selector);
}

/**
 * Alias for document.querySelectorAll.
 *
 * @param {string} selector
 */
export function $all(selector) {
  return document.querySelectorAll(selector);
}
