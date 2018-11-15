(function () {
  // window is undefined in Node and other non-browser environments
  var isBrowser = typeof window !== 'undefined';
  var w = window, d = document, docEl = d.documentElement;
  var forcePolyfill = w.__forceSmoothscrollAnchorPolyfill__ === true;

  // Abort if run outside browser or if smoothscroll is natively supported and
  // __forceSmoothscrollAnchorPolyfill__ is not set to true by user
  if (!isBrowser || !forcePolyfill && 'scrollBehavior' in docEl.style) {
    return;
  }

  // Check if browser supports focus without automatic scrolling (preventScroll)
  var supportsPreventScroll = false;
  try {
    var el = d.createElement('a');
    // Define getter for preventScroll to find out if the browser accesses it
    var preppedFocusOption = Object.defineProperty({}, 'preventScroll', {
      get: function () {
        supportsPreventScroll = true;
      }
    });
    // Trigger focus – if browser uses preventScroll the var will be set to true
    el.focus(preppedFocusOption);
  } catch (e) { }

  /**
   * Get the target element of an event
   * @param {event} evt
   */
  function getEventTarget(evt) {
    evt = evt || w.event;
    return evt.target || evt.srcElement;
  }

  /**
   * Check if an element is an anchor pointing to a target on the current page
   * @param {HTMLElement} el
   */
  function isAnchorToLocalElement(el) {
    return (
      // Is an anchor
      el.tagName && el.tagName.toLowerCase() === 'a' &&
      // Targets an element
      el.href.indexOf('#') > -1 &&
      // Target is on current page
      el.hostname === location.hostname && el.pathname === location.pathname
    );
  }

  /**
   * Focuses an element, if it's not focused after the first try,
   * allows focusing by adjusting tabIndex and retry
   * @param {HTMLElement} el
   */
  function focusElement(el) {
    el.focus({ preventScroll: true });
    if (d.activeElement !== el) {
      el.setAttribute('tabindex', '-1');
      // TODO: Only remove outline if it comes from the UA, not the user CSS
      el.style.outline = 'none';
      el.focus({ preventScroll: true });
    }
  }

  /**
   * Returns the element whose id matches the hash or
   * document.body if the hash is "#top" or "" (empty string)
   * @param {string} hash
   */
  function getScrollTarget(hash) {
    if (typeof hash !== 'string') return null;

    // Retrieve target if an id is specified in the hash, otherwise use body.
    // If hash is "#top" and no target with id "top" was found, also use body
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href
    var target = hash ? d.getElementById(hash.slice(1)) : d.body;
    if (hash === '#top' && !target) target = d.body;
    return target;
  }

  /**
   * Walks up the DOM starting from a given element until an element satisfies the validate function
   * @param {HTMLElement} element The element from where to start validating
   * @param {Function} validate The validation function
   * @returns {HTMLElement|boolean}
   */
  function findInParents(element, validate) {
    if (validate(element)) return element;
    if (element.parentNode) return findInParents(element.parentNode, validate);
    return false;
  }

  // Stores the setTimeout id of pending focus changes, allows aborting them
  var pendingFocusChange;

  /**
   * Scrolls to a given element or to the top if the given element
   * is document.body, then focuses the element
   * @param {HTMLElement} target
   */
  function triggerSmoothscroll(target) {
    // Clear potential pending focus change triggered by a previous scroll
    if (!supportsPreventScroll) clearTimeout(pendingFocusChange);

    // Use JS scroll APIs to scroll to top (if target is body) or to the element
    // This allows polyfills for these APIs to do their smooth scrolling magic
    var scrollTop = target === d.body;
    if (scrollTop) w.scroll({ top: 0, left: 0, behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // If the browser supports preventScroll: immediately focus the target
    // Otherwise schedule the focus so the smoothscroll isn't interrupted
    if (supportsPreventScroll) focusElement(target);
    else pendingFocusChange = setTimeout(focusElement.bind(null, target), 450);
  }

  /**
   * Check if the clicked target is an anchor pointing to a local element,
   * if so prevent the default behavior and handle the scrolling using the
   * native JavaScript scroll APIs so smoothscroll polyfills apply
   * @param {event} evt
   */
  function handleClick(evt) {
    // Abort if shift/ctrl-click or not primary click (button !== 0)
    if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.button !== 0) return;

    // Check the DOM from the click target upwards if a local anchor was clicked
    var anchor = findInParents(getEventTarget(evt), isAnchorToLocalElement);
    if (!anchor) return;

    // Find the element targeted by the hash
    var hash = anchor.hash;
    var target = getScrollTarget(hash);

    if (target) {
      // Prevent default browser behavior to avoid a jump to the anchor target
      evt.preventDefault();

      // Trigger the smooth scroll
      triggerSmoothscroll(target);

      // Append the hash to the URL
      if (history.pushState) history.pushState(null, d.title, (hash || '#'));
    }

  }

  /**
   * Returns the scroll offset towards the top
   */
  function getScrollTop() {
    return docEl.scrollTop || d.body.scrollTop;
  }

  /**
   * Tries to undo the automatic, instant scroll caused by a hashchange
   * and instead scrolls smoothly to the new hash target
   */
  function attachHashchangeListener() {
    // Some browsers don't trigger a scroll event before the hashchange,
    // so to undo, the position last reported is the one we need to go back to.
    // In others (e.g. IE) the scroll listener is triggered before the
    // hashchange occurs, thus the last reported position is already the new one
    // updated by the hashchange – we need the second last to undo.
    var lastTwoScrollPos = [];

    // Keep the scroll positions up to date
    d.addEventListener('scroll', function () {
      lastTwoScrollPos[0] = lastTwoScrollPos[1];
      lastTwoScrollPos[1] = getScrollTop();
    });

    w.addEventListener("hashchange", function () {
      var target = getScrollTarget(location.hash);
      if (!target) return;

      // If the position last reported by the scroll listener is the same as the
      // current one caused by a hashchange, go back to second last – else last
      var currentPos = getScrollTop();
      var top = lastTwoScrollPos[lastTwoScrollPos[1] === currentPos ? 0 : 1];

      // Undo the scroll caused by the hashchange...
      w.scroll({ top: top, behavior: 'instant' });
      // ...and instead smoothscroll to the target
      triggerSmoothscroll(target);
    });
  }

  // Attach listeners if body is already available, else wait until DOM is ready
  if (d.body) attachHashchangeListener();
  else d.addEventListener("DOMContentLoaded", attachHashchangeListener);

  // Register the click handler listening for clicks on anchor links
  d.addEventListener('click', handleClick, false);

})();