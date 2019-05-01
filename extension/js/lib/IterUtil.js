// Return the item in items with the largest getKeyByItem(item).
export function max(items, getKeyByItem) {
  return items.reduce((item1, item2) => {
    return getKeyByItem(item1) > getKeyByItem(item2) ? item1 : item2;
  });
}

// Zip that works with iterables.
// From http://stackoverflow.com/a/10284006/782045
export function zip(rows) {
  return rows[0].map((_, c) => {
    return rows.map((row) => row[c]);
  });
}

// Like zip, but with objects.
// Example:
// - input: {num: [1, 2, 3], str: ["a", "b", "c"]}
// - output: [{num: 1, str: "a"}, {num: 2, str: "b"}, {num: 3, str: "c"}]
export function mapzip(unzipped) {
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
