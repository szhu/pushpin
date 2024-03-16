// TODO: Replace this file with https://github.com/mozilla/webextension-polyfill

/**
 * Make a promise-returning versions of the chrome API method.
 *
 * @param {any} thisObject
 * @param {Function} method
 * @param {string} methodName
 */
export function makePromiseVersion(thisObject, method, methodName) {
  return async (/** @type {any[]} */ ...arguments_) => {
    const result = await new Promise((resolve) => {
      method.apply(thisObject, [...arguments_, resolve]);
    });
    if (chrome.runtime.lastError == null) return result;

    const errorContext = {
      function: methodName,
      arguments: arguments_,
      error: chrome.runtime.lastError,
    };
    console.error("Error in Chrome API call", errorContext);
    throw new Error("Error in Chrome API call");
  };
}

/**
 * Make a promise-returning versions of the chrome API method, given a string
 * like "chrome.windows.create".
 *
 * @param {{[key: string]: any}} dstRoot
 * @param {string} fullMethodName
 */
export function assignPromiseVersionByMethodName(dstRoot, fullMethodName) {
  // Example: let fullMethodName = 'chrome.some.thing.tabs.create'
  const methodParentParts = fullMethodName.split(".");
  // Now methodParentParts == ['chrome', 'some', 'thing', 'tabs', 'create']

  const [methodName] = methodParentParts.splice(-1);
  // Now methodParentParts == ['chrome', 'some', 'thing', 'tabs']
  // Now methodName == 'create'

  if (!methodName) throw new Error("Invalid method name: " + fullMethodName);

  let sourceParent = /** @type {{[key: string]: any}} */ (window);
  for (const methodParentPart of methodParentParts) {
    sourceParent = sourceParent[methodParentPart];
  }
  // Now srcParent == window.chrome.some.thing.tabs
  // srcMethod = srcParent[methodName]; // TODO: is this line necessary?

  let dstParent = dstRoot;
  for (const methodParentPart of methodParentParts.slice(1)) {
    if (dstParent[methodParentPart] == null) dstParent[methodParentPart] = {};
    dstParent = dstParent[methodParentPart];
  }
  // Now dstParent == dstRoot.some.thing.tabs
  dstParent[methodName] = makePromiseVersion(
    sourceParent,
    sourceParent[methodName],
    fullMethodName,
  );
}

/**
 * @param {string[]} fullMethodNames
 * @returns {typeof browser}
 */
export function getPromiseVersions(fullMethodNames) {
  const dstRoot = {};
  for (const fullMethodName of fullMethodNames) {
    assignPromiseVersionByMethodName(dstRoot, fullMethodName);
  }
  return /** @type {typeof browser} */ (dstRoot);
}
