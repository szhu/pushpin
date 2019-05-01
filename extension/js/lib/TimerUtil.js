class CancellablePromise extends Promise {
  constructor(init, cancel) {
    super(init);
    this._cancel = cancel;
  }

  cancel() {
    this._cancel();
  }
}

/**
 * A promise-returning version of setTimeout.
 *
 * @param {number} timeout
 */
export function setTimeout(timeout) {
  let timerId;
  let rejectFunction;
  let init = (resolve, reject) => {
    timerId = window.setTimeout(resolve, timeout);
    rejectFunction = reject;
  };
  let cancel = () => {
    clearTimeout(timerId);
    rejectFunction();
  };
  return new CancellablePromise(init, cancel);
}

/**
 * A promise-returning use case of setInterval.
 */
export function pollUntil(interval, stopCondition) {
  let intervalId;
  let rejectFunction;
  let init = (resolve, reject) => {
    intervalId = setInterval(() => {
      if (stopCondition()) {
        clearInterval(intervalId);
        resolve();
      }
    }, interval);
    rejectFunction = reject;
  };
  let cancel = () => {
    window.clearInterval(intervalId);
    rejectFunction();
  };
  return new CancellablePromise(init, cancel);
}

/**
 * Detect double-clicking-like actions.
 */
export class DoubleAction {
  constructor({ timeout, onSingle, onDouble }) {
    if (!(this instanceof DoubleAction)) {
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
      this.timeoutId = window.setTimeout(() => {
        // console.log("Single!");
        this._dispatch(this.onSingle);
      }, this.timeout);
    }
  };
}
