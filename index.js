(function () {
  // window is undefined in Node and other non-browser environments
  var isBrowser = typeof window !== 'undefined';

  // Abort if run outside browser or if smoothscroll is natively supported and
  // __forceSmoothScrollAnchorPolyfill is not set to true by user
  if (!isBrowser || window.__forceSmoothScrollAnchorPolyfill__ !== true && 'scrollBehavior' in document.documentElement.style) {
    return;
  }

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

  /**
   * Check if the clicked target is an anchor pointing to a local element,
   * if so prevent the default behavior and handle the scrolling using the
   * native JavaScript scroll APIs so smoothscroll polyfills apply
   * @param {event} evt
   */
  function handleClick(evt) {
    var clickTarget = getEventTarget(evt);
    var anchor = findInParents(clickTarget, isAnchorToLocalElement);
    if (!anchor) return;

    // If href ends with '#', no id: just scroll to the top
    var isScrollTop = anchor.href.match(/#$/);
    // Try to retrieve the targeted element
    var targetId = !isScrollTop && anchor.hash.slice(1);
    var target = !isScrollTop && document.getElementById(targetId);

    if (isScrollTop || target) {
      evt.preventDefault();

      if (isScrollTop) window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }

  document.addEventListener('click', handleClick, false);
})()