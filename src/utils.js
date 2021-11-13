// @ts-check

/**
 * @typedef {Object} GlobalFlag
 * @prop {boolean} [__forceSmoothscrollAnchorPolyfill__]
 * **DEPRECATED**: use `polyfill({ force: boolean })`
 *
 * @typedef {typeof globalThis & Window & GlobalFlag} WindowWithFlag
 */

/***/
export const isBrowser = typeof window !== 'undefined'

export const w = isBrowser && /** @type {WindowWithFlag} */ (window)
export const d = isBrowser && document
export const docEl = isBrowser && d.documentElement

const mockEl = isBrowser && d.createElement('a')

export const hasNativeSupport = () => isBrowser && 'scrollBehavior' in mockEl

/**
 * @param {HTMLElement} el
 * @returns {el is HTMLAnchorElement}
 */
const isAnchor = (el) => /^a$/i.test(el.tagName)

/**
 * Check if an element is an anchor pointing to a target on the current page
 * @param {HTMLAnchorElement} anchor
 */
const targetsLocalElement = (anchor) => {
  // False if element isn't "a" or href has no #fragment
  if (!/#/.test(anchor.href)) return false

  // Fix bug in IE9 where anchor.pathname misses leading slash
  let pathname = /** @type {HTMLAnchorElement} */ (anchor).pathname
  if (pathname[0] !== '/') pathname = '/' + pathname

  // False if target isn't current page
  if (anchor.hostname !== location.hostname || pathname !== location.pathname) return false

  // False if anchor targets a ?query that is different from the current one
  // e.g. /?page=1 → /?page=2#content
  if (anchor.search && anchor.search !== location.search) return false

  return true
}

/**
 * @param {HTMLElement} el
 * @returns {?HTMLAnchorElement} The found element or null
 */
export const getAnchor = (el) => {
  if (isAnchor(el) && targetsLocalElement(el)) return el
  return el.parentElement ? getAnchor(el.parentElement) : null
}

/**
 * Returns the element whose id matches the hash or
 * document.body if the hash is "#top" or "" (empty string)
 * @param {string} hash
 */
export const getScrollTarget = (hash) => {
  if (typeof hash !== 'string') return null

  try {
    hash = decodeURIComponent(hash) // "#%F0%9F%91%8D%F0%9F%8F%BB" -> "#👍🏻"
  } catch {}

  // Retrieve target if an id is specified in the hash, otherwise use body.
  // If hash is "#top" and no target with id "top" was found, also use body
  // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href
  let target = hash ? d.getElementById(hash.slice(1)) : d.body
  if (hash === '#top' && !target) target = d.body
  return target
}

/**
 * Focuses an element, if it's not focused after the first try,
 * allow focusing by adjusting tabIndex and retry
 * @param {HTMLElement} el
 */
const focusElement = (el) => {
  const focusOptions = { preventScroll: true }
  el.focus(focusOptions)

  if (d.activeElement !== el) {
    const prevTabIndex = el.getAttribute('tabindex')
    el.setAttribute('tabindex', '-1')

    if (getComputedStyle(el).outlineStyle === 'none') {
      const prevOutline = el.style.outlineStyle
      el.style.outlineStyle = 'none'
      el.addEventListener('blur', function undoOutlineChange() {
        el.style.outlineStyle = prevOutline || ''
        prevTabIndex != null
          ? el.setAttribute('tabindex', prevTabIndex)
          : el.removeAttribute('tabindex')
        el.removeEventListener('blur', undoOutlineChange)
      })
    }

    el.focus(focusOptions)
  }
}

// Stores the setTimeout id of pending focus changes, allows aborting them
let pendingFocusChange

// Check if browser supports focus without automatic scrolling (preventScroll)
let supportsPreventScroll = false
if (isBrowser) {
  try {
    // Define getter for preventScroll to find out if the browser accesses it
    const preppedFocusOption = Object.defineProperty({}, 'preventScroll', {
      // eslint-disable-next-line getter-return
      get() {
        supportsPreventScroll = true
      },
    })
    // Trigger focus – if browser uses preventScroll the const will be set to true
    mockEl.focus(preppedFocusOption)
  } catch {}
}

/**
 * Scrolls to a given element or to the top if the given element
 * is document.body, then focuses the element
 * @param {HTMLElement} target
 */
export const triggerSmoothscroll = (target) => {
  // Clear potential pending focus change triggered by a previous scroll
  if (!supportsPreventScroll) clearTimeout(pendingFocusChange)

  // Use JS scroll APIs to scroll to top (if target is body) or to the element
  // This allows polyfills for these APIs to do their smooth scrolling magic
  const scrollTop = target === d.body
  if (scrollTop) w.scroll({ top: 0, left: 0, behavior: 'smooth' })
  else target.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // If the browser supports preventScroll: immediately focus the target
  // Otherwise schedule the focus so the smoothscroll isn't interrupted
  if (supportsPreventScroll) focusElement(target)
  else pendingFocusChange = setTimeout(focusElement.bind(null, target), 450)
}

/**
 * Returns true if scroll-behavior: smooth is set and not overwritten
 * by a higher-specifity declaration, else returns false
 */
export const shouldSmoothscroll = () => {
  // Regex to extract the value following the scroll-behavior property name
  const extractValue = /scroll-behavior:[\s]*([^;"']+)/
  const docElStyle = getComputedStyle(docEl)
  // Values to check for set scroll-behavior in order of priority/specificity
  const valuesToCheck = [
    // Priority 1: behavior assigned to style property
    // Allows toggling smoothscroll from JS (docEl.style.scrollBehavior = ...)
    docEl.style.scrollBehavior,
    // Priority 2: behavior specified inline in style attribute
    (extractValue.exec(docEl.getAttribute('style')) || [])[1],
    // Priority 3: custom property
    // Behaves like regular CSS, e.g. allows using media queries
    docElStyle.getPropertyValue('--scroll-behavior'),
    // Priority 4: behavior specified in fontFamily
    // Same use case as priority 3, but supports legacy browsers without CSS vars
    (extractValue.exec(docElStyle.fontFamily) || [])[1],
  ]

  // Loop over values in specified order, return once a valid value is found
  for (var i = 0; i < valuesToCheck.length; i++) {
    const value = valuesToCheck[i] && valuesToCheck[i].trim()
    if (/^smooth$/.test(value)) return true
    if (/^(initial|inherit|auto|unset)$/.test(value)) return false
  }
  // No value found? Return false, no set value = no smoothscroll :(
  return false
}
