// https://gist.github.com/josh/8177583
export const Ready = new Promise((resolve) => {
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
});
