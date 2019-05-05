# Pushpin

Pinned tabs in Chrome are nice, but if you expect to always have the same set of
pinned tabs open, you may be frustrated by how unpersistent they are. **Pushpin
can help.**

[Install Pushpin from the Chrome Web Store.](https://chrome.google.com/webstore/detail/oeccdogiekfcglkneepeaodoendiikic)

## Usage

![screen recording](resources/screencast-0-800@15.gif)

Pushpin lets you configure your favorite set of pinned tabs. Just go to the
extension's options page and add a list of URLs.

To open your pinned tabs in the current window, click the Pushpin icon. If the
pinned tabs are already open in another window, Pushpin will move them to the
current window. This is done without reloading the tab, so it's perfect for
using a pinned tab to play music.

Webapps are buggy sometimes, and you might need to reset them. Double-click
Pushpin to reload all your pinned tabs, even if they're already open.

## Roadmap

Possible future features:

- Prevent pinned tabs from being closed, either with a confirmation dialog or by
  re-opening pinned tabs if they are closed.
- Accept multiple pinned tab configurations that can be cycled through.
- Accept advanced pinned tab configurations (for example, keeping a tab always
  muted).
- Quickly close or deactivate all pinned tabs.
- Smarter restoration of tabs after some but not all of them have been closed.
- Configurable keyboard shortcuts for jumping to/from a pinned tab.

If you want any of these to happen, please create an issue and/or contribute!

## Contributing

To load the local version of this extension into Chrome:

- Go to `chrome://extensions`.
- At the top-right, make sure **Developer mode** is turned on.
- Drag the `extension` folder into the tab.
- Note that the "Pushpin" entry has a reload (circular arrow) button next to it.
  After modifying extension code, click the reload button to apply the changes.

There are no special tools required to edit this project's code -- there isn't
even a compile process! However, if you are contributing PRs or otherwise want
to avoid making bugs, this project has a linter (ESLint), formatter (Prettier),
and typechecker (TypeScript) configured to make sure that the code is as
error-free and readable as possible.

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
