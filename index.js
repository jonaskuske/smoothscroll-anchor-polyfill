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
   * @param {HTMLElement} element
   */
  function isAnchorToLocalElement(element) {
    var localHostname = location.hostname;
    var localPathname = location.pathname;

    return (
      // Is an anchor
      element.tagName.toLowerCase() === 'a' &&
      // Targets an element
      element.href.indexOf('#') > 0 &&
      // Target is on current page
      element.hostname === localHostname && element.pathname === localPathname
    );
  }

  /**
   * Check if the clicked target is an anchor pointing to a local element, if so prevent the default behavior and handle the scrolling using the native JavaScript scroll APIs so smoothscroll-Polyfills apply
   * @param {event} evt
   */
  function handleClick(evt) {
    var element = getEventTarget(evt);
    if (!isAnchorToLocalElement(element)) return;

    // If href ends with '#', no id: just scroll to the top
    var isScrollTop = element.href.match(/#$/);
    // Try to retrieve the targeted element
    var targetId = !isScrollTop && element.hash.slice(1);
    var target = !isScrollTop && document.getElementById(targetId);

    if (isScrollTop || target) {
      evt.preventDefault();

      if (isScrollTop) window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  }

  document.addEventListener('click', handleClick, false);
})()