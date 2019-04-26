/* jshint esversion: 6 */
/* jshint eqnull: true */

let Chrome = ChromeApiUtil.getPromiseVersions([
  'chrome.storage.sync.get',
  'chrome.storage.sync.set',
  'chrome.tabs.create',
  'chrome.tabs.discard',
  'chrome.tabs.duplicate',
  'chrome.tabs.get',
  'chrome.tabs.getAllInWindow',
  'chrome.tabs.getCurrent',
  'chrome.tabs.move',
  'chrome.tabs.query',
  'chrome.tabs.reload',
  'chrome.tabs.remove',
  'chrome.tabs.update',
  'chrome.windows.create',
  'chrome.windows.getAll',
  'chrome.windows.getCurrent',
  'chrome.windows.getLastFocused',
  'chrome.windows.remove',
  'chrome.windows.update',
]);

// Get the window with the most pinned tabs.
// Extra properties:
// - tabs: a list of tabs
// - pinnedTabs: a list of the pinned tabs
function getWindowWithPinnedTabs() {
  return Promise.resolve()
    .then(() => {
      return Chrome.windows.getAll({
        windowTypes: ['normal'],
      });
    })
    .then((windows) => {
      return Promise.all(
        windows.map((window) => {
          return Chrome.tabs
            .query({
              windowId: window.id,
              pinned: true,
            })
            .then((pinnedTabs) => {
              window.pinnedTabs = pinnedTabs;
              return window;
            });
        }),
      );
    })
    .then((windows) => {
      return IterUtil.max(windows, (window) => {
        return window.pinnedTabs.length;
      });
    });
}

function openPinnedTabUrlsInWindow(pinnedTabUrls, window) {
  return Promise.all(
    pinnedTabUrls.map((pinnedTabUrl) => {
      return Chrome.tabs.create({
        windowId: window.id,
        url: pinnedTabUrl,
        pinned: true,
        active: false,
      });
    }),
  );
}

function updateTabsWithUrls(tabs, urls) {
  return Promise.all(
    IterUtil.mapzip({ tab: tabs, url: urls }).map(({ tab, url }) => {
      return Chrome.tabs.update(tab.id, { url });
    }),
  );
}

function movePinnedTabsToWindow(tabs, window) {
  Promise.resolve()
    .then(() => {
      return Chrome.tabs.move(tabs.map((tab) => tab.id), {
        windowId: window.id,
        index: -1,
      });
    })
    .then(() => {
      return Chrome.tabs.getAllInWindow(window.id);
    })
    .then((newTabs) => {
      return newTabs.slice(newTabs.length - tabs.length);
    })
    .then((tabsToPin) => {
      return Promise.all(
        tabsToPin.map((tabToPin) => {
          return Chrome.tabs.update(tabToPin.id, { pinned: true });
        }),
      );
    });
}

function redoPinnedTabs(pinnedTabUrlsPromise, refresh) {
  Promise.resolve()
    .then(() => {
      return PromiseUtil.map({
        pinnedTabUrls: pinnedTabUrlsPromise,
        windowWithPinnedTabs: getWindowWithPinnedTabs(),
        frontmostWindow: Chrome.windows.getLastFocused({
          populate: true,
          windowTypes: ['normal'],
        }),
      });
    })
    .then(({ frontmostWindow, pinnedTabUrls, windowWithPinnedTabs }) => {
      let { pinnedTabs } = windowWithPinnedTabs;

      // If the correct number of tabs are open, we can keep the existing tabs.
      if (pinnedTabs.length === pinnedTabUrls.length) {
        return Promise.resolve()
          .then(() => {
            if (windowWithPinnedTabs.id === frontmostWindow.id)
              return undefined;

            // If window with pinned tabs isn't frontmost:
            return Promise.all([
              // Move tabs to the frontmost window.
              movePinnedTabsToWindow(pinnedTabs, frontmostWindow),
              // Close all New Tab Page tabs in the old window.
              Chrome.tabs
                .query({
                  windowId: windowWithPinnedTabs.id,
                  pinned: false,
                  url: 'chrome://newtab/',
                })
                .then((tabs) => {
                  return Chrome.tabs.remove(tabs.map((tab) => tab.id));
                }),
            ]);
          })
          .then(() => {
            if (!refresh) return undefined;

            // If `refresh`, refresh all the tabs.
            return updateTabsWithUrls(pinnedTabs, pinnedTabUrls);
          });
      }

      // If the wrong number of tabs are open, close and reopen all of them.

      return Promise.all([
        Chrome.tabs.remove(pinnedTabs.map((tab) => tab.id)),
        openPinnedTabUrlsInWindow(pinnedTabUrls, frontmostWindow),
      ]);
    });
}

let clickBrowserAction = new TimerUtil.DoubleAction({
  timeout: 300,
  onSingle: () => {
    redoPinnedTabs(Urls.load(), false);
  },
  onDouble: () => {
    redoPinnedTabs(Urls.load(), true);
  },
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener((tab) => {
  clickBrowserAction.trigger();
});
