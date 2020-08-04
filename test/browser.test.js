import {
  setupBrowserEnv,
  mockNativeSupport,
  setStyleAttr,
  insertAnchor,
  insertElement,
} from './test-utils.js'

import { polyfill, destroy } from '../src/index.js'

setupBrowserEnv()
beforeEach(destroy)

describe('General', () => {
  it('Bails out if scrollBehavior is natively supported', () => {
    setStyleAttr('scroll-behavior:smooth')
    mockNativeSupport()
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).not.toHaveBeenCalled()
  })

  it('Runs even with native support if force flag is set on window', () => {
    setStyleAttr('scroll-behavior:smooth')
    mockNativeSupport()
    window.__forceSmoothscrollAnchorPolyfill__ = true
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalled()
  })

  it('Runs even with native support if force flag is passed as arg', () => {
    setStyleAttr('scroll-behavior:smooth')
    mockNativeSupport()
    polyfill({ force: true })

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalled()
  })

  it('Allows force flag passed as arg to override global force flag', () => {
    setStyleAttr('scroll-behavior:smooth')
    mockNativeSupport()

    window.__forceSmoothscrollAnchorPolyfill__ = true
    polyfill({ force: false })

    const anchor = insertAnchor()

    anchor.click()
    // Should have be called due to global flag
    expect(window.scroll).toHaveBeenCalledTimes(0)

    window.__forceSmoothscrollAnchorPolyfill__ = false
    polyfill({ force: true })

    anchor.click()
    // Should not have been called again due to override
    expect(window.scroll).toHaveBeenCalledTimes(1)
  })
})

describe('Scroll targeting', () => {
  it('Scrolls to top if target hash is "#top" or "#"', () => {
    setStyleAttr('scroll-behavior:smooth')
    polyfill()

    const anchor = insertAnchor({ href: '#top' })
    const anchorTwo = insertAnchor({ href: '#' })

    anchor.click()
    anchorTwo.click()
    expect(window.scroll).toHaveBeenCalledTimes(2)
  })

  it('Scrolls to targeted element if anchor targets its ID', () => {
    setStyleAttr('scroll-behavior:smooth')
    polyfill()

    const anchor = insertAnchor({ href: '#target' })
    const target = insertElement('div', { id: 'target' })

    anchor.click()
    expect(window.scroll).not.toHaveBeenCalled()
    expect(target.scrollIntoView).toHaveBeenCalled()
  })

  it('Supports (URL-encoded) special characters in the hash', () => {
    setStyleAttr('scroll-behavior:smooth')
    polyfill()

    const specialCharacters = 'emöji―💕'
    // hash automatically encoded to #em%C3%B6ji%E2%80%95%F0%9F%92%95
    const anchor = insertAnchor({ href: `#${specialCharacters}` })
    const target = insertElement('div', { id: specialCharacters })

    anchor.click()
    expect(target.scrollIntoView).toHaveBeenCalled()
    expect(location.hash).toMatch(`#${encodeURIComponent(specialCharacters)}`)
  })

  it('Scrolls to element instead of top if hash "#top" targets an ID', () => {
    setStyleAttr('scroll-behavior:smooth')
    polyfill()

    const anchor = insertAnchor({ href: '#top' })
    const target = insertElement('div', { id: 'top' })

    anchor.click()
    expect(target.scrollIntoView).toHaveBeenCalled()
    expect(window.scroll).not.toHaveBeenCalled()
  })

  it('Bails out if anchor targets a URL with different query param', () => {
    history.pushState(null, '', '?a')
    setStyleAttr('scroll-behavior:smooth')
    polyfill()

    const noQuery = insertAnchor({ href: '#top' })
    const sameQuery = insertAnchor({ href: '?a#top' })
    const diffQuery = insertAnchor({ href: '?b#top' })

    // works if anchor target has no query at all
    noQuery.click()
    expect(window.scroll).toHaveBeenCalledTimes(1)
    // works if anchor target has same query as current one
    sameQuery.click()
    expect(window.scroll).toHaveBeenCalledTimes(2)
    // bails out if query is different from current one
    diffQuery.click()
    expect(window.scroll).toHaveBeenCalledTimes(2)
  })
})

describe('Ways to enable/disable', () => {
  it('Can be enabled by computedStyle of fontFamily on html', () => {
    setStyleAttr('font: 100 1rem "scroll-behavior: smooth"')
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalled()
  })

  it('Can be enabled through the style attribute on <html>', () => {
    setStyleAttr('scroll-behavior:smooth')
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalled()
  })

  it('Can be enabled by documentElement.style.scrollBehavior', () => {
    document.documentElement.style.scrollBehavior = 'smooth'
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalled()
  })

  it('Can be disabled through property with higher specificity', () => {
    insertElement(
      'style',
      { textContent: `html { font: 100 1rem "scroll-behavior: smooth" }` },
      true
    )
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalledTimes(1)

    // Inline style attribute should overwrite regular CSS and disable
    setStyleAttr('scroll-behavior:auto')

    anchor.click()
    expect(window.scroll).toHaveBeenCalledTimes(1)

    // Style property should overwrite style attribute, enable again
    document.documentElement.style.scrollBehavior = 'smooth'

    anchor.click()
    expect(window.scroll).toHaveBeenCalledTimes(2)
  })

  it('Can be disabled with destroy()', () => {
    setStyleAttr('scroll-behavior:smooth')
    polyfill()
    destroy()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).not.toHaveBeenCalled()
  })

  it('Can be re-enabled with polyfill()', () => {
    setStyleAttr('scroll-behavior:smooth')
    polyfill()
    destroy()
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalledTimes(1)
  })
})

describe('Toggling during runtime', () => {
  it('Responds to documentElement.style.scrollBehavior', () => {
    document.documentElement.style.scrollBehavior = 'smooth'
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalledTimes(1)
  })

  it('Responds to computedStyle of font-family', () => {
    polyfill()

    const anchor = insertAnchor()

    anchor.click()
    expect(window.scroll).toHaveBeenCalledTimes(0)
    setStyleAttr('font: 100 1rem "scroll-behavior:smooth"')
    anchor.click()
    expect(window.scroll).toHaveBeenCalledTimes(1)
    setStyleAttr('font: 100 1rem "scroll-behavior:inherit"')
    anchor.click()
    expect(window.scroll).toHaveBeenCalledTimes(1)
  })

  it('Allows aborting navigation using evt.preventDefault()', () => {
    setStyleAttr('scroll-behavior:smooth')
    polyfill()

    const anchor = insertAnchor()
    anchor.addEventListener('click', (evt) => evt.preventDefault())

    anchor.click()
    expect(window.scroll).not.toHaveBeenCalled()
  })
})
