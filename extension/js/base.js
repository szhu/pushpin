export const IterUtil = {
  // Return the item in items with the largest getKeyByItem(item).
  max(items, getKeyByItem) {
    return items.reduce((item1, item2) => {
      return getKeyByItem(item1) > getKeyByItem(item2) ? item1 : item2;
    });
  },

  // Zip that works with iterables.
  // From http://stackoverflow.com/a/10284006/782045
  zip(rows) {
    return rows[0].map((_, c) => {
      return rows.map((row) => row[c]);
    });
  },

  // Like zip, but with objects.
  // Example:
  // - input: {num: [1, 2, 3], str: ["a", "b", "c"]}
  // - output: [{num: 1, str: "a"}, {num: 2, str: "b"}, {num: 3, str: "c"}]
  mapzip(unzipped) {
    let zipped = [];
    for (let key of Object.keys(unzipped)) {
      let vals = unzipped[key];
      for (let i = 0; i < vals.length; i++) {
        zipped[i] = zipped[i] || {};
        zipped[i][key] = vals[i];
      }
    }
    return zipped;
  },
};

export const PromiseUtil = {
  // Like Promise.all, but with objects.
  map(promiseByKey) {
    let keys = Object.keys(promiseByKey);
    return Promise.resolve()
      .then(() => {
        return Promise.all(keys.map((key) => promiseByKey[key]));
      })
      .then((results) => {
        let resultsByKey = {};
        for (let i = 0; i < keys.length; i++) {
          resultsByKey[keys[i]] = results[i];
        }
        return resultsByKey;
      });
  },
};

export const TimerUtil = {
  // A promise-returning version of setTimeout.
  setTimeout(timeout) {
    let timerId;
    let rejectFunction;
    let promise = new Promise((resolve, reject) => {
      timerId = setTimeout(resolve, timeout);
      rejectFunction = reject;
    });
    promise.cancel = () => {
      clearTimeout(timerId);
      rejectFunction();
    };
    return promise;
  },

  // A promise-returning use case of setInterval.
  pollUntil(interval, stopCondition) {
    let intervalId;
    let rejectFunction;
    let promise = new Promise((resolve, reject) => {
      intervalId = setInterval(() => {
        if (stopCondition()) {
          clearInterval(intervalId);
          resolve();
        }
      }, interval);
      rejectFunction = reject;
    });
    promise.cancel = () => {
      window.cancelInterval(intervalId);
      rejectFunction();
    };
    return promise;
  },

  // Detect double-clicking-like actions.
  DoubleAction: class DoubleAction {
    constructor({ timeout, onSingle, onDouble }) {
      if (!(this instanceof TimerUtil.DoubleAction)) {
        throw new Error('TimerUtil.DoubleAction must be initialized using new');
      }
      this.timeout = timeout;
      this.onSingle = onSingle;
      this.onDouble = onDouble;
      this.timeoutId = undefined;
    }

    _dispatch = (callback) => {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
      callback();
    };

    trigger = () => {
      // console.log("Click!");
      if (this.timeoutId != null) {
        // console.log("Double!");
        this._dispatch(this.onDouble);
      } else {
        // console.log("Starting timer...");
        this.timeoutId = setTimeout(() => {
          // console.log("Single!");
          this._dispatch(this.onSingle);
        }, this.timeout);
      }
    };
  },
};

// https://gist.github.com/josh/8177583
export const DOMUtil = {
  ready: new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      let onReady = () => {
        resolve();
        document.removeEventListener('DOMContentLoaded', onReady, true);
        window.removeEventListener('load', onReady, true);
      };
      document.addEventListener('DOMContentLoaded', onReady, true);
      window.addEventListener('load', onReady, true);
    }
  }),
};

export const ChromeApiUtil = {
  // Make a promise-returning versions of the chrome API method.
  makePromiseVersion(theThis, theMethod, theMethodName) {
    return (...theArguments) => {
      return new Promise((resolve, reject) => {
        theMethod.apply(
          theThis,
          theArguments.concat((result) => {
            return chrome.runtime.lastError == null
              ? resolve(result)
              : reject(
                  new Error({
                    function: theMethodName,
                    arguments: theArguments,
                    error: chrome.runtime.lastError,
                  }),
                );
          }),
        );
      });
    };
  },

  // Make a promise-returning versions of the chrome API method,
  // given a string like "chrome.windows.create".
  assignPromiseVersionByMethodName(dstRoot, fullMethodName) {
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
  },

  getPromiseVersions(fullMethodNames) {
    let dstRoot = {};
    for (let fullMethodName of fullMethodNames) {
      this.assignPromiseVersionByMethodName(dstRoot, fullMethodName);
    }
    return dstRoot;
  },
};

export const Chrome = ChromeApiUtil.getPromiseVersions([
  'chrome.storage.sync.get',
  'chrome.storage.sync.set',
]);

export const Urls = {
  stringify(urls) {
    return urls.map((url) => `${url}\n`).join('');
  },

  parse(urlsAsText) {
    // Filter out blank lines
    return urlsAsText.split('\n').filter((line) => line);
  },

  normalize(urlsAsText) {
    return this.stringify(this.parse(urlsAsText));
  },

  saveText(urlsAsText) {
    return Promise.resolve().then(() => {
      return Chrome.storage.sync.set({
        urls: this.normalize(urlsAsText),
      });
    });
  },

  load() {
    return Promise.resolve()
      .then(() => {
        return Chrome.storage.sync.get({
          urls: '',
        });
      })
      .then(({ urls }) => {
        return this.parse(urls);
      });
  },
};