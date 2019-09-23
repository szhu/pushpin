/**
 * A class that memoizes a calculation for a single value.
 *
 * @template T
 */
export class LazyStateCache {
  /**
   * @private
   * @type {(() => T)}
   */
  getter;

  /**
   * @private
   * @type {T | undefined}
   */
  cachedValue = undefined;

  /**
   * @param {(() => T)} getter
   */
  constructor(getter) {
    this.getter = getter;
  }

  /**
   * Calculate the value, or recall it if it already has been calculated.
   *
   * @returns {T}
   */
  get() {
    if (this.cachedValue === undefined) {
      this.cachedValue = this.getter();
    }
    return this.cachedValue;
  }

  /**
   * Forget the memoized value.
   */
  forget() {
    this.cachedValue = undefined;
  }
}
