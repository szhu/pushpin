/**
 * Like Promise.all, but with objects.
 */
export async function map(promiseByKey) {
  let keys = Object.keys(promiseByKey);
  const results = await Promise.all(keys.map((key) => promiseByKey[key]));
  let resultsByKey = {};
  for (let i = 0; i < keys.length; i++) {
    resultsByKey[keys[i]] = results[i];
  }
  return resultsByKey;
}
