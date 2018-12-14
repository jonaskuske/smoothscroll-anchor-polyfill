// @ts-check

/**
 * @license
 * smoothscroll-anchor-polyfill __VERSION__
 * (c) 2018 Jonas Kuske
 * Released under the MIT License.
 */

(function(global, Factory) {
    var SmoothscrollAnchorPolyfill = new Factory();
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = SmoothscrollAnchorPolyfill;
    } else {
        global.SmoothscrollAnchorPolyfill = SmoothscrollAnchorPolyfill;
    }
    SmoothscrollAnchorPolyfill.polyfill();
})(this, /** @constructor */ function SmoothscrollAnchorPolyfill() {

    var instance = this, isBrowser = typeof window !== 'undefined';

    if (isBrowser) {
        /**
         * Add flag to Window interface, workaround for type check
         * @typedef {{__forceSmoothscrollAnchorPolyfill__: [boolean]}} GlobalFlag
         * @typedef {Window & GlobalFlag} WindowWithFlag
         * @type {WindowWithFlag} */
        var w = (window), d = document, docEl = d.documentElement;
    }

    /**
     * Starts the polyfill by attaching the neccessary EventListeners
     *
     * Aborts, if ('scrollBehavior' in documentElement.style) and the force flag
     * isn't set on the options parameter Object or globally on window
     * @param {PolyfillOptions} [opts] Options for invoking
     * @returns {SmoothscrollAnchorPolyfill} Polyfill Instance, allows for chaining
     *
     * @typedef {Object} PolyfillOptions
     * @prop {boolean} [force] Enable despite native support, overrides global flag
     */
    this.polyfill = function(opts) {
        opts = opts || {};
        if (isBrowser) {
            var globalFlag = w.__forceSmoothscrollAnchorPolyfill__;
            var force = typeof opts.force === 'boolean' ? opts.force : globalFlag;

            // Abort if smoothscroll has native support and force flag isn't set
            if ('scrollBehavior' in docEl.style && !force) return instance;

            d.addEventListener('click', handleClick, false);
            d.addEventListener('scroll', trackScrollPositions);
            w.addEventListener('hashchange', handleHashChange);
        }
        return instance;
    };

    /**
     * Stops the polyfill by removing all EventListeners
     * @returns {SmoothscrollAnchorPolyfill} Polyfill Instance, allows for chaining
     */
    this.destroy = function() {
        if (isBrowser) {
            d.removeEventListener('click', handleClick, false);
            d.removeEventListener('scroll', trackScrollPositions);
            w.removeEventListener('hashchange', handleHashChange);
        }
        return instance;
    };

    if (!isBrowser) return;

    // Check if browser supports focus without automatic scrolling (preventScroll)
    var supportsPreventScroll = false;
    try {
        var el = d.createElement('a');
        // Define getter for preventScroll to find out if the browser accesses it
        var preppedFocusOption = Object.defineProperty({}, 'preventScroll', {
            get: function() {
                supportsPreventScroll = true;
            }
        });
        // Trigger focus – if browser uses preventScroll the var will be set to true
        el.focus(preppedFocusOption);
    } catch (e) { }

    // Regex to extract the value following the scroll-behavior property name
    var extractValue = /scroll-behavior:[\s]*([^;"`'\s]+)/;

    /**
     * Returns true if scroll-behavior: smooth is set and not overwritten
     * by a higher-specifity declaration, else returns false
     */
    function shouldSmoothscroll() {
        // Values to check for set scroll-behavior in order of priority/specificity
        var valuesToCheck = [
            // Priority 1: behavior assigned to style property
            // Allows toggling smoothscroll from JS (docEl.style.scrollBehavior = ...)
            docEl.style.scrollBehavior,
            // Priority 2: behavior specified inline in style attribute
            (extractValue.exec(docEl.getAttribute('style')) || [])[1],
            // Priority 3: behavior specified in fontFamily
            // Behaves like regular CSS, e.g. allows using media queries
            (extractValue.exec(getComputedStyle(docEl).fontFamily) || [])[1]
        ];
        // Loop over values in specified order, return once a valid value is found
        for (var i = 0; i < valuesToCheck.length; i++) {
            var specifiedBehavior = getScrollBehavior(valuesToCheck[i]);
            if (specifiedBehavior !== null) return specifiedBehavior;
        }
        // No value found? Return false, no set value = no smoothscroll :(
        return false;
    }

    /**
     * If a valid CSS property value for scroll-behavior is passed, returns
     * whether it specifies smooth scroll behavior or not, else returns null
     * @param {any} value The value to check
     * @returns {?boolean} The specified scroll behavior or null
     */
    function getScrollBehavior(value) {
        var status = null;
        if (/^smooth$/.test(value)) status = true;
        if (/^(initial|inherit|auto|unset)$/.test(value)) status = false;
        return status;
    }

    /**
     * Get the target element of an event
     * @param {Event} evt
     * @returns {HTMLElement}
     */
    function getEventTarget(evt) {
        evt = evt || w.event;
        return /** @type {HTMLElement} */ (evt.target || evt.srcElement);
    }

    /**
     * Check if an element is an anchor pointing to a target on the current page
     * @param {HTMLAnchorElement} el
     * @returns {boolean}
     */
    function isAnchorToLocalElement(el) {
        // Check if element is an anchor with a fragment in the url
        if (!/^a$/i.test(el.tagName) || !/#/.test(el.href)) return false;

        // Fix bug in IE9 where anchor.pathname misses leading slash
        var anchorPath = el.pathname;
        if (anchorPath[0] !== '/') anchorPath = '/' + anchorPath;

        // Check if anchor targets an element on the current page
        return (
            el.hostname === location.hostname && anchorPath === location.pathname
        );
    }

    /**
     * Focuses an element, if it's not focused after the first try,
     * allow focusing by adjusting tabIndex and retry
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
        hash = decodeHash(hash);

        // Retrieve target if an id is specified in the hash, otherwise use body.
        // If hash is "#top" and no target with id "top" was found, also use body
        // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href
        var target = hash ? d.getElementById(hash.slice(1)) : d.body;
        if (hash === '#top' && !target) target = d.body;
        return target;
    }

    /**
     * Takes a URL-encoded hash and returns the decoded version.
     * @param {string} hash Hash to decode
     */
    function decodeHash(hash) {
        try {
            // "#%F0%9F%91%8D%F0%9F%8F%BB" -> "#👍🏻"
            hash = decodeURIComponent(hash);
        } catch (e) { /* */ }
        return hash;
    }

    /**
     * Walks up the DOM starting from "element" until an element satisfies "validate()"
     * @param {HTMLElement} element The element from where to start validating
     * @param {function} validate Validation function, receives current element as arg
     * @returns {?HTMLElement} The found element or null
     */
    function findInParents(element, validate) {
        if (validate(element)) return element;
        if (element.parentElement) return findInParents(element.parentElement, validate);
        return null;
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
     * @param {MouseEvent} evt
     */
    function handleClick(evt) {
        // Abort if shift/ctrl-click or not primary click (button !== 0)
        if (evt.metaKey || evt.ctrlKey || evt.shiftKey || evt.button !== 0) return;
        // scroll-behavior not set to smooth? Bail out, let browser handle it
        if (!shouldSmoothscroll()) return;

        // Check the DOM from the click target upwards if a local anchor was clicked
        var anchor = /** @type {?HTMLAnchorElement} */ (
            findInParents(getEventTarget(evt), isAnchorToLocalElement)
        );
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

    // To enable smooth scrolling on hashchange, we need to immediately restore
    // the scroll pos after a hashchange changed it, so we track it constantly.
    // Some browsers don't trigger a scroll event before the hashchange,
    // so to undo, the position from last scroll is the one we need to go back to.
    // In others (e.g. IE) the scroll listener is triggered again before the
    // hashchange occurs and the last reported position is already the new one
    // updated by the hashchange – we need the second last to undo there.
    // Because of this we don't track just the last, but the last two positions.
    var lastTwoScrollPos = [];

    /**
      * Tries to undo the automatic, instant scroll caused by a hashchange
      * and instead scrolls smoothly to the new hash target
      */
    function handleHashChange() {
        // scroll-behavior not set to smooth or body not parsed yet? Abort
        if (!d.body || !shouldSmoothscroll()) return;

        var target = getScrollTarget(location.hash);
        if (!target) return;

        // If the position last reported by the scroll listener is the same as the
        // current one caused by a hashchange, go back to second last – else last
        var currentPos = getScrollTop();
        var top = lastTwoScrollPos[lastTwoScrollPos[1] === currentPos ? 0 : 1];

        // @ts-ignore
        // Undo the scroll caused by the hashchange...
        // Using {behavior: 'instant'} even though it's not in the spec anymore as
        // Blink & Gecko support it – once an engine with native support doesn't,
        // we need to disable scroll-behavior during scroll reset, then restore
        w.scroll({ top: top, behavior: 'instant' });
        // ...and instead smoothscroll to the target
        triggerSmoothscroll(target);
    }

    /**
     * Returns the scroll offset towards the top
     */
    function getScrollTop() {
        return docEl.scrollTop || d.body.scrollTop;
    }

    /**
     * Update the last two scroll positions
     */
    function trackScrollPositions() {
        if (!d.body) return; // Body not parsed yet? Abort
        lastTwoScrollPos[0] = lastTwoScrollPos[1];
        lastTwoScrollPos[1] = getScrollTop();
    }
});
