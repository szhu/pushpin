/**
 * Make a promise-returning versions of the chrome API method.
 */
export function makePromiseVersion(theThis, theMethod, theMethodName) {
  return (...theArguments) => {
    return new Promise((resolve, reject) => {
      theMethod.apply(
        theThis,
        theArguments.concat((result) => {
          return chrome.runtime.lastError == null
            ? resolve(result)
            : reject({
                function: theMethodName,
                arguments: theArguments,
                error: chrome.runtime.lastError,
              });
        }),
      );
    });
  };
}

/**
 * Make a promise-returning versions of the chrome API method, given a string like
 * "chrome.windows.create".
 */
export function assignPromiseVersionByMethodName(dstRoot, fullMethodName) {
  // Example: let fullMethodName = 'chrome.some.thing.tabs.create'
  let methodParentParts = fullMethodName.split('.');
  // Now methodParentParts == ['chrome', 'some', 'thing', 'tabs', 'create']

  let [methodName] = methodParentParts.splice(-1);
  // Now methodParentParts == ['chrome', 'some', 'thing', 'tabs']
  // Now methodName == 'create'

  let srcParent = window;
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
  dstParent[methodName] = this.makePromiseVersion(
    srcParent,
    srcParent[methodName],
    fullMethodName,
  );
}

export function getPromiseVersions(fullMethodNames) {
  let dstRoot = {};
  for (let fullMethodName of fullMethodNames) {
    this.assignPromiseVersionByMethodName(dstRoot, fullMethodName);
  }
  return dstRoot;
}
