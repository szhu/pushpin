import * as ChromeApiUtil from "./lib/ChromeApiUtil.js";
import * as IterUtil from "./lib/IterUtil.js";
import * as TimerUtil from "./lib/TimerUtil.js";
import * as Urls from "./lib/Urls.js";
import { LazyStateCache } from "./lib/LazyStateCache.js";

let Chrome = ChromeApiUtil.getPromiseVersions([
  "chrome.storage.sync.get",
  "chrome.storage.sync.set",
  "chrome.tabs.create",
  "chrome.tabs.discard",
  "chrome.tabs.duplicate",
  "chrome.tabs.get",
  "chrome.tabs.getAllInWindow",
  "chrome.tabs.getCurrent",
  "chrome.tabs.getSelected",
  "chrome.tabs.highlight",
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
 * List all windows.
 */
const AllNormalWindows = new LazyStateCache(async () =>
  Chrome.windows.getAll({ windowTypes: ["normal"] }),
);

/**
 * Get the window with the most pinned tabs.
 */
const PinnedTabWindowAndTabs = new LazyStateCache(async () => {
  const windows = await AllNormalWindows.get();
  const pinnedTabsLists = await Promise.all(
    windows.map(async (window) =>
      Chrome.tabs.query({ windowId: window.id, pinned: true }),
    ),
  );
  let { window, pinnedTabs } = IterUtil.max(
    IterUtil.mapzip({ window: windows, pinnedTabs: pinnedTabsLists }),
    (pair) => pair.pinnedTabs.length,
  );

  /** @type {[browser.windows.Window, browser.tabs.Tab[]]} */
  let returnValue = [window, pinnedTabs];

  return returnValue;
});

/**
 * Get the configured pinned tab URLs.
 */
const PinnedTabUrls = new LazyStateCache(async () => Urls.load());

/**
 * Get the frontmost window.
 */
const FrontmostWindow = new LazyStateCache(async () =>
  Chrome.windows.getLastFocused({
    windowTypes: ["normal"],
  }),
);

/**
 * Get the frontmost window.
 */
const CurrentPinnedTabIndex = new LazyStateCache(async () => {
  let [, pinnedTabs] = await PinnedTabWindowAndTabs.get();
  let selectedTab = await Chrome.tabs.getSelected();

  let index = pinnedTabs.findIndex(
    (pinnedTab) => pinnedTab.id === selectedTab.id,
  );

  return index === -1 ? undefined : index;
});

/**
 * chrome.windows.WINDOW_ID_CURRENT
 * windowType
 */
const TabsInFrontmostWindow = new LazyStateCache(async () =>
  Chrome.tabs.query({
    lastFocusedWindow: true,
    windowType: "normal",
  }),
);

function resetAllCaches() {
  AllNormalWindows.forget();
  PinnedTabWindowAndTabs.forget();
  PinnedTabUrls.forget();
  FrontmostWindow.forget();
  CurrentPinnedTabIndex.forget();
  TabsInFrontmostWindow.forget();
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
 * Returns the action taken.
 *
 * @returns {Promise<"fresh-reset" | "moved-to-fg" | "no-action">}
 */
async function bringPinnedTabsForward() {
  let frontmostWindow = await FrontmostWindow.get();
  let [pinnedTabWindow, pinnedTabs] = await PinnedTabWindowAndTabs.get();
  let pinnedTabUrls = await PinnedTabUrls.get();

  if (pinnedTabs.length !== pinnedTabUrls.length) {
    // If the wrong number of tabs are open, close and reopen all of them.
    await Promise.all([
      removeTabs(pinnedTabs),
      openPinnedTabUrlsInWindow(pinnedTabUrls, frontmostWindow),
    ]);
    return "fresh-reset";
  }

  // If the correct number of tabs are open, we can keep the existing tabs.
  if (pinnedTabWindow.id !== frontmostWindow.id) {
    // If window with pinned tabs isn't frontmost...

    // Move the pinned tabs to the frontmost window.
    await movePinnedTabsToWindow(pinnedTabs, frontmostWindow);

    // Close all new tab pages in the old window.
    let isNewTabPageInWindow = {
      windowId: pinnedTabWindow.id,
      pinned: false,
      url: "chrome://newtab/",
    };
    let tabs = await Chrome.tabs.query(isNewTabPageInWindow);
    await removeTabs(tabs);

    return "moved-to-fg";
  }

  return "no-action";
}

/**
 * Reload the configured pinned tab URLs into the existing pinned tabs.
 */
async function reloadPinnedTabUrlsIntoCurrentPinnedTabs() {
  let [, pinnedTabs] = await PinnedTabWindowAndTabs.get();
  let pinnedTabUrls = await PinnedTabUrls.get();

  await updateTabsWithUrls(pinnedTabs, pinnedTabUrls);
}

/**
 * Reload the configured pinned tab URLs into the existing pinned tabs.
 */
async function reloadPinnedTabUrlsIntoCurrentTab() {
  let [, pinnedTabs] = await PinnedTabWindowAndTabs.get();
  let pinnedTabUrls = await PinnedTabUrls.get();
  let i = await CurrentPinnedTabIndex.get();

  if (i === undefined) return;

  await updateTabsWithUrls([pinnedTabs[i]], [pinnedTabUrls[i]]);
}

/**
 * Highlight the n-th normal tab in the window. This should do the same thing as
 * the native Ctrl-1 through Ctrl-9 actions, expect that we ignore pinned tabs.
 *
 * @param {number} index
 * - Tabs are 0-indexed.
 * - Negative index counts from the right. (-1 = last tab.)
 */
async function focusNormalTabAtIndex(index) {
  let tabs = await TabsInFrontmostWindow.get();

  let countPinned = tabs.filter((tab) => tab.pinned).length;

  let actualIndex = index < 0 ? tabs.length + index : countPinned + index;
  let tab = tabs[actualIndex];

  if (!tab) return;
  if (!tab.windowId) return;

  await Chrome.tabs.highlight({ windowId: tab.windowId, tabs: actualIndex });
  await Chrome.windows.update(tab.windowId, { focused: true });
}

/**
 * Highlight the n-th pinned tab.
 *
 * @param {number} index
 * - Tabs are 0-indexed.
 */
async function focusedPinnedTabAtIndex(index) {
  let [, pinnedTabs] = await PinnedTabWindowAndTabs.get();

  let tab = pinnedTabs[index];
  if (!tab) return;
  if (!tab.windowId) return;
  if (!tab.pinned) return;

  await Chrome.tabs.highlight({ windowId: tab.windowId, tabs: index });
  await Chrome.windows.update(tab.windowId, { focused: true });
}

let clickBrowserAction = new TimerUtil.DoubleAction({
  timeout: 300,
  onSingle: async () => {
    resetAllCaches();
    let action = await bringPinnedTabsForward();
    if (action === "no-action") {
      reloadPinnedTabUrlsIntoCurrentTab();
    }
  },
  onDouble: async () => {
    resetAllCaches();
    let action = await bringPinnedTabsForward();
    if (action === "no-action" || action === "moved-to-fg") {
      reloadPinnedTabUrlsIntoCurrentPinnedTabs();
    }
  },
});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener((_tab) => {
  clickBrowserAction.trigger();
});

chrome.commands.onCommand.addListener(function commandHandler(
  /** @type {string} */ command,
) {
  resetAllCaches();

  switch (command) {
    // Active normal tabs.
    case "activate-normal-tab-0":
      return focusNormalTabAtIndex(0);
    case "activate-normal-tab-1":
      return focusNormalTabAtIndex(1);
    case "activate-normal-tab-2":
      return focusNormalTabAtIndex(2);
    case "activate-normal-tab-3":
      return focusNormalTabAtIndex(3);
    case "activate-normal-tab-4":
      return focusNormalTabAtIndex(4);
    case "activate-normal-tab-5":
      return focusNormalTabAtIndex(5);
    case "activate-normal-tab-6":
      return focusNormalTabAtIndex(6);
    case "activate-normal-tab-7":
      return focusNormalTabAtIndex(7);
    case "activate-normal-tab-8":
      return focusNormalTabAtIndex(8);
    case "activate-normal-tab-last":
      return focusNormalTabAtIndex(-1);

    // Active pinned tabs.
    case "activate-pinned-tab-0":
      return focusedPinnedTabAtIndex(0);
    case "activate-pinned-tab-1":
      return focusedPinnedTabAtIndex(1);
    case "activate-pinned-tab-2":
      return focusedPinnedTabAtIndex(2);
    case "activate-pinned-tab-3":
      return focusedPinnedTabAtIndex(3);
    case "activate-pinned-tab-4":
      return focusedPinnedTabAtIndex(4);
    case "activate-pinned-tab-5":
      return focusedPinnedTabAtIndex(5);
    case "activate-pinned-tab-6":
      return focusedPinnedTabAtIndex(6);
    case "activate-pinned-tab-7":
      return focusedPinnedTabAtIndex(7);
    case "activate-pinned-tab-8":
      return focusedPinnedTabAtIndex(8);
    case "activate-pinned-tab-9":
      return focusedPinnedTabAtIndex(9);
    default:
  }
});
