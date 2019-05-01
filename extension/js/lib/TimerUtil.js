// @ts-check

// A promise-returning version of setTimeout.
export function setTimeout(timeout) {
  let timerId;
  let rejectFunction;
  let promise = new Promise((resolve, reject) => {
    timerId = window.setTimeout(resolve, timeout);
    rejectFunction = reject;
  });
  promise.cancel = () => {
    clearTimeout(timerId);
    rejectFunction();
  };
  return promise;
}

// A promise-returning use case of setInterval.
export function pollUntil(interval, stopCondition) {
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
    window.clearInterval(intervalId);
    rejectFunction();
  };
  return promise;
}

// Detect double-clicking-like actions.
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
