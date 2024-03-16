/**
 * Return the item in items with the largest `getKeyByItem(item)`.
 *
 * @template T
 * @param {T[]} items
 * @param {(item: T) => any} getKeyByItem
 * @returns {T}
 */
export function max(items, getKeyByItem) {
  return items.reduce((item1, item2) => {
    return getKeyByItem(item1) > getKeyByItem(item2) ? item1 : item2;
  });
}

/**
 * Zip that works with iterables.
 *
 * @template T
 * @param {T[][]} rows
 * @returns {T[][]}
 */
export function zip(rows) {
  // From http://stackoverflow.com/a/10284006/782045
  return rows[0].map((_, c) => {
    return rows.map((row) => row[c]);
  });
}

/**
 * Like zip, but with objects.
 *
 *      mapzip({num: [1, 2, 3], str: ["a", "b", "c"]})
 *      => [{num: 1, str: "a"}, {num: 2, str: "b"}, {num: 3, str: "c"}]
 *
 * @template {{ [key: string]: any }} T
 * @param {{ [key in keyof T]: T[key][] }} unzipped
 * @returns {T[]}
 */
export function mapzip(unzipped) {
  /** @type {T[]} */
  let zipped = [];
  for (let key of Object.keys(unzipped)) {
    let vals = unzipped[key];
    for (let i = 0; i < vals.length; i++) {
      zipped[i] = zipped[i] || {};
      zipped[i][key] = vals[i];
    }
  }
  return zipped;
}

/**
 * @template T
 * @param {T | null | undefined} value
 * @returns {value is T}
 */
function notNullOrUndefined(value) {
  return value != null;
}

/**
 * Removes null and undefined from the array. Note: Doesn't remove 0, false, or
 * any other falsy values.
 *
 * @template T
 * @param {(T | null | undefined)[]} items
 * @returns {T[]}
 */
export function compact(items) {
  return items.filter(notNullOrUndefined);
}
