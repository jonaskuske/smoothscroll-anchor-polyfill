// @ts-check
import {
  w,
  d,
  docEl,
  isBrowser,
  hasNativeSupport,
  getAnchor,
  getScrollTarget,
  shouldSmoothscroll,
  triggerSmoothscroll,
} from './utils.js'

const defaultExport = { polyfill, destroy }

/**
 * Starts the polyfill by attaching the neccessary EventListeners
 *
 * Bails out if scrollBehavior is natively supported and the force flag
 * isn't set on the options argument or globally on window
 * @param {PolyfillOptions} [opts] Options for invoking the polyfill
 *
 * @typedef {Object} PolyfillOptions
 * @prop {boolean} [force] Enable despite native support, overrides global flag
 */
function polyfill(opts = {}) {
  destroy() // Remove previous listeners

  if (isBrowser) {
    const globalFlag = w.__forceSmoothscrollAnchorPolyfill__
    const force = typeof opts.force === 'boolean' ? opts.force : globalFlag
    // Abort if smoothscroll has native support and force flag isn't set
    if (hasNativeSupport() && !force) return

    d.addEventListener('click', handleClick, false)
    d.addEventListener('scroll', trackScrollPositions)
    w.addEventListener('hashchange', handleHashChange)
  }

  return defaultExport
}

/** Stops the polyfill by removing all EventListeners */
function destroy() {
  if (isBrowser) {
    d.removeEventListener('click', handleClick, false)
    d.removeEventListener('scroll', trackScrollPositions)
    w.removeEventListener('hashchange', handleHashChange)
  }

  return defaultExport
}

/**
 * Checks if the clicked target is an anchor pointing to a local element.
 * If so, prevents default behavior and handles the scroll using the
 * native JavaScript scroll APIs so smoothscroll-polyfill applies
 * @param {MouseEvent} evt
 */
function handleClick(evt) {
  const notPrimaryClick = evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.button !== 0
  if (evt.defaultPrevented || notPrimaryClick) return

  // scroll-behavior not set to smooth? Bail out, let browser handle it
  if (!shouldSmoothscroll()) return

  // Check the DOM from the click target upwards if a local anchor was clicked
  const anchor = getAnchor(/** @type {HTMLElement} */ (evt.target))
  if (!anchor) return

  // Find the element targeted by the hash
  const target = getScrollTarget(anchor.hash)

  if (target) {
    // Prevent default browser behavior to avoid a jump to the anchor target
    evt.preventDefault()

    // Trigger the smooth scroll
    triggerSmoothscroll(target)

    // Append the hash to the URL
    if (history.pushState) history.pushState(null, d.title, anchor.href)
  }
}

// To enable smooth scrolling on hashchange, we need to immediately restore
// the scroll pos after a hashchange changed it, so we track it constantly.
// Some browsers don't trigger a scroll event before the hashchange,
// so to undo, the position from last scroll is the one we need to go back to.
// In others (e.g. IE) the scroll listener is triggered again before the
// hashchange occurs and the last reported position is already the new one
// updated by the hashchange – we need the second last to undo there.
// Because of this we don't track just the last, but the last two positions.
const lastTwoScrollPos = []

/** Returns the scroll offset towards the top */
const getScrollTop = () => docEl.scrollTop || d.body.scrollTop

/**
 * Tries to undo the automatic, instant scroll caused by a hashchange
 * and instead scrolls smoothly to the new hash target
 */
function handleHashChange() {
  // scroll-behavior not set to smooth or body not parsed yet? Abort
  if (!d.body || !shouldSmoothscroll()) return

  const target = getScrollTarget(location.hash)
  if (!target) return

  // If the position last reported by the scroll listener is the same as the
  // current one caused by a hashchange, go back to second last – else last
  const currentPos = getScrollTop()
  const top = lastTwoScrollPos[lastTwoScrollPos[1] === currentPos ? 0 : 1]

  // @ts-ignore
  // Undo the scroll caused by the hashchange...
  // Using {behavior: 'instant'} even though it's not in the spec anymore as
  // Blink & Gecko support it – once an engine with native support doesn't,
  // we need to disable scroll-behavior during scroll reset, then restore
  w.scroll({ top, behavior: 'instant' })
  // ...and instead smoothscroll to the target
  triggerSmoothscroll(target)
}

/** Update the last two scroll positions */
function trackScrollPositions() {
  if (!d.body) return // Body not parsed yet? Abort
  lastTwoScrollPos[0] = lastTwoScrollPos[1]
  lastTwoScrollPos[1] = getScrollTop()
}

polyfill()

export { polyfill, destroy }
export default defaultExport
