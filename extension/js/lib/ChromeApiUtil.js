// TODO: Replace this file with https://github.com/mozilla/webextension-polyfill

/**
 * Make a promise-returning versions of the chrome API method.
 *
 * @param {any} thisObj
 * @param {Function} method
 * @param {string} methodName
 */
export function makePromiseVersion(thisObj, method, methodName) {
  return async (/** @type {any[]} */ ...args) => {
    let result = await new Promise((resolve) => {
      method.apply(thisObj, [...args, resolve]);
    });
    if (chrome.runtime.lastError == null) return result;

    let errorContext = {
      function: methodName,
      arguments: args,
      error: chrome.runtime.lastError,
    };
    throw errorContext;
  };
}

/**
 * Make a promise-returning versions of the chrome API method, given a string
 * like "chrome.windows.create".
 *
 * @param {Object} dstRoot
 * @param {string} fullMethodName
 */
export function assignPromiseVersionByMethodName(dstRoot, fullMethodName) {
  // Example: let fullMethodName = 'chrome.some.thing.tabs.create'
  let methodParentParts = fullMethodName.split(".");
  // Now methodParentParts == ['chrome', 'some', 'thing', 'tabs', 'create']

  let [methodName] = methodParentParts.splice(-1);
  // Now methodParentParts == ['chrome', 'some', 'thing', 'tabs']
  // Now methodName == 'create'

  let srcParent = /** @type {Object} */ (window);
  for (let methodParentPart of methodParentParts) {
    srcParent = srcParent[methodParentPart];
  }
  // Now srcParent == window.chrome.some.thing.tabs
  // srcMethod = srcParent[methodName]; // TODO: is this line necessary?

  let dstParent = dstRoot;
  for (let methodParentPart of methodParentParts.slice(1)) {
    if (dstParent[methodParentPart] == null) dstParent[methodParentPart] = {};
    dstParent = dstParent[methodParentPart];
  }
  // Now dstParent == dstRoot.some.thing.tabs
  dstParent[methodName] = makePromiseVersion(
    srcParent,
    srcParent[methodName],
    fullMethodName,
  );
}

/**
 * @param {string[]} fullMethodNames
 * @returns {typeof browser}
 */
export function getPromiseVersions(fullMethodNames) {
  let dstRoot = {};
  for (let fullMethodName of fullMethodNames) {
    assignPromiseVersionByMethodName(dstRoot, fullMethodName);
  }
  return /** @type {typeof browser} */ (dstRoot);
}
