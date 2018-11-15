(function () {
  // window is undefined in Node and other non-browser environments
  var isBrowser = typeof window !== 'undefined';

  // Abort if run outside browser or if smoothscroll is natively supported and
  // __forceSmoothscrollAnchorPolyfill__ is not set to true by user
  if (!isBrowser || window.__forceSmoothscrollAnchorPolyfill__ !== true && 'scrollBehavior' in document.documentElement.style) {
    return;
  }

  // Check if browser supports focus without automatic scrolling (preventScroll)
  var supportsPreventScroll = false;
  try {
    var el = document.createElement('a');
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
    evt = evt || window.event;
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
   * allow focusing by adjusting tabIndex and retry
   * @param {HTMLElement} el
   */
  function focusElement(el) {
    el.focus({ preventScroll: true });
    if (document.activeElement !== el) {
      el.setAttribute('tabIndex', '-1');
      // TODO: Only remove outline if it comes from the UA, not the user CSS
      el.style.outline = 'none';
      el.focus({ preventScroll: true });
    }
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
   * Check if the clicked target is an anchor pointing to a local element,
   * if so prevent the default behavior and handle the scrolling using the
   * native JavaScript scroll APIs so smoothscroll polyfills apply
   * @param {event} evt
   */
  function handleClick(evt) {
    // Abort if shift/ctrl-click or not primary click (button !== 0)
    if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.button !== 0) return;

    var clickTarget = getEventTarget(evt);
    // Check the DOM from the click target upwards if a local anchor was clicked
    var anchor = findInParents(clickTarget, isAnchorToLocalElement);
    if (!anchor) return;

    var hash = anchor.hash;

    // Retrieve target if an id is specified in the hash, otherwise use body.
    // If hash is "#top" and no target with id "top" was found, also use body
    // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href
    var target = hash ? document.getElementById(hash.slice(1)) : document.body;
    if (hash === '#top' && !target) target = document.body;

    if (target) {
      // Prevent default browser behavior to avoid a jump to the anchor target
      evt.preventDefault();
      // Clear potential pending focus change triggered by a previous scroll
      if (!supportsPreventScroll) window.clearTimeout(pendingFocusChange);

      // Use scroll APIs to scroll to top (if target is body) or to the element
      // This allows polyfills for these APIs to do their smooth scrolling magic
      var scrollTop = target === document.body;
      if (scrollTop) window.scroll({ top: 0, left: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // If the browser supports preventScroll: immediately focus the target
      // Otherwise schedule the focus so the smoothscroll isn't interrupted
      if (supportsPreventScroll) focusElement(target);
      else pendingFocusChange = setTimeout(focusElement, 450, target);
    }

  }

  document.addEventListener('click', handleClick, false);
})()