import { DOMUtil, TimerUtil, Urls } from './base.js';

let Options = {
  save() {
    Promise.resolve()
      .then(() => {
        let urlsAsText = document.getElementById('js-input-urls').value;
        return Urls.saveText(urlsAsText);
      })
      .then(() => {
        return this.restore();
      })
      .then(() => {
        document.getElementById('js-status').textContent = 'Options saved.';
      })
      .then(() => {
        return TimerUtil.setTimeout(2000);
      })
      .then(() => {
        document.getElementById('js-status').textContent = '';
      });
  },

  restore() {
    return Promise.resolve()
      .then(() => {
        return Urls.load();
      })
      .then((urls) => {
        document.getElementById('js-input-urls').value = Urls.stringify(urls);
      });
  },
};

Promise.resolve(() => {
  return DOMUtil.ready();
})
  .then(() => {
    return Options.restore();
  })
  .then(() => {
    document.getElementById('js-submit').addEventListener('click', () => {
      Options.save();
    });
  });

Promise.resolve(() => {
  return DOMUtil.ready();
})
  .then(() => {
    document.documentElement.style.minHeight = '1000px';
  })
  .then(() => {
    return TimerUtil.pollUntil(10, () => {
      return window.innerHeight > 100;
    });
  })
  .then(() => {
    return TimerUtil.setTimeout(200);
  })
  .then(() => {
    document.documentElement.style.minHeight = '100vh';
  });
