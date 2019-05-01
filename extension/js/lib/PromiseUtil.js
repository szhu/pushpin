// Like Promise.all, but with objects.
export function map(promiseByKey) {
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
}
