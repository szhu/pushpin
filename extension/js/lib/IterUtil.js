/**
 * Return the item in items with the largest `getKeyByItem(item)`.
 *
 * @template T
 * @param {T[]} items
 * @param {(item: T) => any} getKeyByItem
 * @returns {T}
 */
export function max(items, getKeyByItem) {
  // eslint-disable-next-line unicorn/no-array-reduce
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
  const firstRow = rows[0];

  if (firstRow == null) {
    return [];
  }

  // From http://stackoverflow.com/a/10284006/782045
  return firstRow.map((_, c) => {
    return rows.map((row, r) => {
      const cell = row[c];
      if (cell == null) {
        throw new Error(`rows[${r}][${c}] is null`);
      }
      return cell;
    });
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
  const zipped = [];
  for (const key of Object.keys(unzipped)) {
    const vals = unzipped[key];
    if (vals == null) {
      throw new Error(`unzipped[${key}] is null`);
    }
    for (const [index, value] of vals.entries()) {
      const object = zipped[index] || /** @type {any} */ ({});
      object[key] = value;
      zipped[index] = object;
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
  return /** @type { T[] } */ (
    items.filter((element) => notNullOrUndefined(element))
  );
}
