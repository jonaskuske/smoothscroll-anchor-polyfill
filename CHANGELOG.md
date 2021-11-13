# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.3] - TBA

### Changed

- Build setup now uses `rollup` for more robust artifacts (decreases file sizes for `.mjs` files but increases them for `.js` files)
- Upgraded all dependencies
- Updated year in copyright notices
- Added `package#packageManager` field to support corepack

### Fixed

- Prevent global scope pollution in UMD builds (previous babel/terser setup created global variables `e` and `t`)

## [1.3.2] - 2020-04-12

### Fixed

- The scroll navigation is now prevented if you call `event.preventDefault()` on the click event (fix #32)
- Polyfill now skips handling click events if the href has a query string that is different from the current one (fix #28)  
  Previously, a navigation from `/?page=1` to `/?page=2#content` would not work: because the path is the same, the polyfill would intercept the navigation even though the different query params meant that the target was an entirely different page/website

## [1.3.0] - 2019-06-12

### Added

- Support Css variable `scroll-behavior`
- UMD/AMD module with `define()`

### Changed

- Deprecated `window.__forceSmoothscrollAnchorPolyfill__` (use `polyfill({ force: true })` instead)

### Fixed

- After focusing a scroll target, the outline is only forcefully removed if it wasn't set by the user

## [1.3.0-beta.1] - 2019-06-11

### Changed

- Minor adjustments to improve bundle size

## [1.3.0-beta.0] - 2019-03-26

### Added

- The CSS custom property `--scroll-behavior` can now be used to adjust scroll behavior. The `font-family` workaround still works for supporting legacy browsers that don't implement CSS variables
- Now usable as UMD module with `define()` syntax

### Fixed

- After focusing a scroll target, the outline is only forcefully removed if it wasn't set by the user

## [1.2.0] - 2018-12-14

### Added

- ES Module versions are now provided as `index.mjs` and `index.min.mjs`!
- Firefox bug where `<a href="#top">` doesn't smooth scroll now mentioned in docs

### Changed

- Update docs to mention Firefox supporting both `scroll-behavior` and `prefers-reduced-motion`

### Fixed

- Support for (URL-encoded) special characters in fragments, e.g. "#👍🏻" (which the browser will encode to "#%F0%9F%91%8D%F0%9F%8F%BB")

## [1.1.3] - 2018-12-10

### Changed

- Updated README to include bundle size and SSR-compatibility as features
- Minor improvements to JSDoc typings

### Fixed

- Automatically prefix `anchor.pathname` with leading slash if it's missing in `isAnchorToLocalElement()`, fixes flickering in IE9 (caused by clicks being handled by `handleHashchange()` instead of `handleClick` due to click handler not detecting the anchor)
- Use correct property value in `font-family` example in README

## [1.1.2] - 2018-12-10

### Fixed

- Include minified version in bundle published to npm

## [1.1.1] - 2018-12-10

### Fixed

- Entry `"unpkg"` now actually points at minified version

## [1.1.0] - 2018-12-10

### Added

- `destroy()` and `polyfill()` now return the polyfill instance so you can chain them
- Tests for Node environment (→ SSR), `destroy()`, `polyfill()` and `{ force }` override
- Improved JSDoc typing for better IntelliSense completion
- Entry `"unpkg"` in `package.json`, points at minified version so CDN serves smaller file

### Changed

- You can now override `window.__forceSmoothscrollAnchorPolyfill__` with the `{ force: boolean }` argument of `polyfill()`
- Package entry (`"main"`) now points to unminified file so typing hints are kept
- Explain usage of `{ behavior: 'instant' }` (not in spec anymore) + outline alternative

### Fixed

- (Regression) Prevent 'window is not defined' error in Node environments

## [1.0.1] - 2018-12-08

### Added

- Added feature overview to README

## [1.0.0] - 2018-12-08

### Added

- The methods 'destroy' and 'polyfill' are now exported (CommonJS) or exposed on window.SmoothscrollAnchorPolyfill. The polyfill still runs automatically on load so embedding it is enough, but now you can destroy it if you want (EventListeners are removed) and start it again, later.
- In addition to `window.__forceSmoothscrollAnchorPolyfill__`, you can now pass `{ force: true }` when invoking `polyfill()` to force-enable the package even in browsers with native support

### Changed

- Updated the documentation website to reflect the new API
- Moved the documentation in a separate docs/ folder to clean up the repo
- Small fixes for formatting and typos in the README

## [1.0.0-beta] - 2018-12-05

### Changed

- The README.md file has been updated to match the API of v1.0.0
- BREAKING: Polyfill now only handles smooth scroll if scroll-behavior is set to 'smooth' via &lt;html style="">, documentElement.style.scrollBehavior or a custom font-family (more information will be added to the documentation)

### Added

- Tests for smooth scrolling when clicking anchors have been implemented

### Fixed

- Fixed 'window is not defined' error in Node environments, important for usage with SSR

## [0.12.0] - 2018-11-15

### Added

- The special fragment `#top` is now supported for scrolling to the top, but only if no element with id `top` is found
- After navigating to an anchor, the respective hash is now appended to the URL using `history.pushState()` to match default browser behavior.
- When a hashchange event occurs, the polyfill tries to cancel the instant jumping scroll to the new hash, handling it with the smooth scroll instead.
- When navigating to an anchor, the anchor is now focused.
- In browsers supporting the optional `preventScroll` argument, the anchor is focused immediately and the focus scroll is prevented by passing this argument.
- If the browser doesn't support `preventScroll` (e.g. Internet Explorer), the focus is scheduled to happen 450ms after the smooth scroll started so it does not interfere with the smooth scrolling (which caused flickering).

### Changed

- The flag to enforce the polyfill (even if the browser has native support) is now called (`window.__forceSmoothscrollAnchorPolyfill__`). The docs have been updated to reflect this.

### Fixed

- The polyfill now properly handles Shift/Meta keys and allows for opening links in new windows by shift-clicking instead of preventing it with `event.preventDefault()`
- The docs website now works in Internet Explorer 9, polyfills for `Element.classList`, `requestAnimationFrame` + an alternative for flexbox layouts have been added

## [0.9.4] - 2018-11-11

### Fixed

- After a click, the DOM is now searched upwards for a matching anchor link instead of just checking the event target alone. Fixes issue with nested elements inside anchor links
