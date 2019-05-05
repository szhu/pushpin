import * as ChromeApiUtil from "./lib/ChromeApiUtil.js";
import * as IterUtil from "./lib/IterUtil.js";
import * as TimerUtil from "./lib/TimerUtil.js";
import * as Urls from "./lib/Urls.js";

let Chrome = ChromeApiUtil.getPromiseVersions([
  "chrome.storage.sync.get",
  "chrome.storage.sync.set",
  "chrome.tabs.create",
  "chrome.tabs.discard",
  "chrome.tabs.duplicate",
  "chrome.tabs.get",
  "chrome.tabs.getAllInWindow",
  "chrome.tabs.getCurrent",
  "chrome.tabs.move",
  "chrome.tabs.query",
  "chrome.tabs.reload",
  "chrome.tabs.remove",
  "chrome.tabs.update",
  "chrome.windows.create",
  "chrome.windows.getAll",
  "chrome.windows.getCurrent",
  "chrome.windows.getLastFocused",
  "chrome.windows.remove",
  "chrome.windows.update",
]);

/**
 * Get the window with the most pinned tabs.
 *
 * @returns {Promise<browser.windows.Window & {pinnedTabs: browser.tabs.Tab[]}>}
 */
async function getWindowWithPinnedTabs() {
  const windows = await Chrome.windows.getAll({ windowTypes: ["normal"] });
  const windowsWithPinnedTabs = await Promise.all(
    windows.map(async (window) => {
      let windowId = window.id;
      let pinnedTabs = await Chrome.tabs.query({ windowId, pinned: true });
      return { pinnedTabs, ...window };
    }),
  );
  let windowWithMostPinnedTabs = IterUtil.max(
    windowsWithPinnedTabs,
    (window) => window.pinnedTabs.length,
  );
  return windowWithMostPinnedTabs;
}

/**
 * @param {string[]} pinnedTabUrls
 * @param {browser.windows.Window} window
 */
function openPinnedTabUrlsInWindow(pinnedTabUrls, window) {
  return Promise.all(
    pinnedTabUrls.map((pinnedTabUrl) =>
      Chrome.tabs.create({
        windowId: window.id,
        url: pinnedTabUrl,
        pinned: true,
        active: false,
      }),
    ),
  );
}

/**
 * @param {browser.tabs.Tab[]} tabs
 * @param {string[]} urls
 */
async function updateTabsWithUrls(tabs, urls) {
  return Promise.all(
    IterUtil.mapzip({ tab: tabs, url: urls }).map(async ({ tab, url }) => {
      if (tab.id) await Chrome.tabs.update(tab.id, { url });
    }),
  );
}

/**
 * @param {browser.tabs.Tab[]} tabs
 * @param {browser.windows.Window} window
 */
async function movePinnedTabsToWindow(tabs, window) {
  let endOfWindow = { windowId: window.id, index: -1 };
  Chrome.tabs.move(IterUtil.compact(tabs.map((tab) => tab.id)), endOfWindow);
  const newTabs = await Chrome.tabs.getAllInWindow(window.id);
  const tabsToPin = newTabs.slice(newTabs.length - tabs.length);
  await Promise.all(
    IterUtil.compact(tabsToPin.map((tab) => tab.id)).map((tabId) =>
      Chrome.tabs.update(tabId, { pinned: true }),
    ),
  );
}

/**
 * @param {browser.tabs.Tab[]} tabs
 */
async function removeTabs(tabs) {
  await Chrome.tabs.remove(IterUtil.compact(tabs.map((tab) => tab.id)));
}

/**
 * Ensure that the pinned tabs are pinned in the frontmost window.
 *
 * @param {Promise<string[]>} pinnedTabUrlsPromise
 * @param {boolean} refresh Whether to force all pinned tabs to refresh.
 */
async function redoPinnedTabs(pinnedTabUrlsPromise, refresh) {
  let frontmostWindow = await Chrome.windows.getLastFocused({
    populate: true,
    windowTypes: ["normal"],
  });
  let window = await getWindowWithPinnedTabs();
  let pinnedTabUrls = await pinnedTabUrlsPromise;

  if (window.pinnedTabs.length !== pinnedTabUrls.length) {
    let x = window.pinnedTabs.map((tab) => tab.id).filter(Boolean);
    // If the wrong number of tabs are open, close and reopen all of them.
    await Promise.all([
      removeTabs(window.pinnedTabs),
      openPinnedTabUrlsInWindow(pinnedTabUrls, frontmostWindow),
    ]);
    return;
  }

  // If the correct number of tabs are open, we can keep the existing tabs.

  if (window.id !== frontmostWindow.id) {
    // If window with pinned tabs isn't frontmost...

    // Move the pinned tabs to the frontmost window.
    await movePinnedTabsToWindow(window.pinnedTabs, frontmostWindow);

    // Close all new tab pages in the old window.
    let isNewTabPageInWindow = {
      windowId: window.id,
      pinned: false,
      url: "chrome://newtab/",
    };
    let tabs = await Chrome.tabs.query(isNewTabPageInWindow);
    await removeTabs(tabs);
  }

  if (refresh) {
    await updateTabsWithUrls(window.pinnedTabs, pinnedTabUrls);
  }
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
chrome.browserAction.onClicked.addListener((_tab) => {
  clickBrowserAction.trigger();
});
