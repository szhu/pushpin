# Pushpin

Pinned tabs in Chrome are nice, but if you expect to always have the same set of
pinned tabs open, you may be frustrated by how unpersistent they are. **Pushpin
can help!**

Pushpin lets you:

- Configure your favorite set of pinned tabs
- Reset all or each pinned tab back to your configuration
- Move your pinned tabs to the front window without reloading them
- Set keyboard shortcuts for each pinned tab (shortcuts can be global)
- Modify your keyboard shortcuts so that Ctrl-n will open the n-th unpinned tab

## [Install Pushpin from the Chrome Web Store.](https://chrome.google.com/webstore/detail/oeccdogiekfcglkneepeaodoendiikic)

![screen recording](resources/screencast-0-800@15.gif)

## Usage

### Configure your favorite pinned tabs

Pushpin lets you configure your favorite set of pinned tabs. Right-click the
extension icon, go to Options, and add a list of URLs.

To open your pinned tabs in the current window, click the Pushpin icon. If the
pinned tabs are already open in another window, Pushpin will move them to the
current window. This is done without reloading the tab, so it works well, even
if you're using a pinned tab to play music.

### Reload your pinned tabs

If you're on a pinned tab and you want to reset it back to the configured URL
(or reload the tab), just click the Pushpin icon.

Webapps are buggy sometimes, and sometimes you might need to reset all of them
at once. Double-click Pushpin to reload all your pinned tabs.

### Set keyboard shortcuts for your pinned tabs

After you've set up Pushpin, go to `chrome://extensions/shortcuts` to set up
keyboard shortcuts for your tabs.

You can set up a keyboard shortcut for each of your pinned tabs, so that you can
quickly jump to the webapp you want. You can even make these shortcuts global so
that they work from any app! If you press the keyboard shortcut for a tab and
you are already on that tab, the tab will reload to the configured URL for that
pinned tab. (This is useful for when you've strayed far away from the original
pinned tab URL and you want to go back.)

By default on Chrome, Ctrl-1 - Ctrl-9 (Cmd-1 - Cmd-9 on Mac) will jump you to
the _n_-th tab, but this can be not ideal if you'd like these shortcuts to
exclude the pinned tabs. With Pushpin, you can also set up keyboard shortcuts
for jumping to each unpinned tab. You can set them to Ctrl-1 - Ctrl-9 to
override the Chrome defaults.

## Roadmap

Possible future features:

- Prevent pinned tabs from being closed, either with a confirmation dialog or by
  re-opening pinned tabs if they are closed.
- Accept multiple pinned tab configurations that can be cycled through.
- Accept advanced pinned tab configurations (for example, keeping a tab always
  muted, or having a tab be deacivated by default).
- Quickly close or deactivate all pinned tabs.
- Smarter restoration of tabs after some but not all of them have been closed.

I typically work on these features when I really want them and/or when I have
time. If you want any of these to happen faster, please create an issue or PR!

## Contributing

The setup of this project has been optimized to make contributions as simple as
possible. There are no special tools required to edit this project's code --
there isn't even a compililation step!

If you are contributing PRs or otherwise want to avoid making bugs, this project
has a linter (ESLint), formatter (Prettier), and typechecker (TypeScript)
configured to make sure that the code is as error-free and readable as possible.

- To have these tools automatically check your code before each commit, just run
  `npm install` (or `pnpm install` or `yarn install`).
- You can also set up your editor to check for errors as you type. Follow the
  step above, then install the plugins/extensions for ESLint, Prettier, and
  TypeScript for your editor.
- Note that this project uses TypeScript but not TypeScript syntax. Instead, we
  use JavaScript with JSDoc comments that contain type information. This allows
  us to avoid having a compile process, while having the same great
  type-checking that TypeScript can provide. TS/JSDoc syntax reference:
  https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html

To test out your changes in Chrome:

- Go to `chrome://extensions`.
- At the top-right, make sure **Developer mode** is turned on.
- If you have the published version of Pushpin installed, you might want to turn
  off temporarily to reduce confusion. You can do that by toggling the switch
  next to it.
- Drag the `extension` folder into the tab.
- Note that the "Pushpin" entry has a reload (circular arrow) button next to it.
  After modifying extension code, click the reload button to apply the changes.
