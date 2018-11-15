# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
