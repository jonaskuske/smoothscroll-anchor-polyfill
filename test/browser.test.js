const SmoothscrollAnchorPolyfill = require('../index')
const { polyfill, destroy } = SmoothscrollAnchorPolyfill

const insertElement = (type, attrs) => {
  const el = document.createElement(type)
  if (attrs) Object.entries(attrs).forEach(([name, value]) => {
    el[name] = value
  })
  document.body.append(el)
  return el
}

beforeAll(destroy); // Undo auto-execution of polyfill on load
beforeEach(() => {
  window.scroll = f => f
  Element.prototype.scrollIntoView = f => f
})
afterEach(() => {
  delete window.scroll
  delete Element.prototype.scrollIntoView
  delete document.documentElement.style.scrollBehavior
  delete document.documentElement.style.font
  delete window.__forceSmoothscrollAnchorPolyfill__

  document.documentElement.removeAttribute('style')
  document.body.innerHTML = ''
  destroy()
})

describe('General', () => {
  it('Bails out if scrollBehavior is natively supported', () => {
    const anchor = insertElement('a', { href: '#' })

    // Mock native support
    document.documentElement.style.scrollBehavior = 'smooth'

    const spy = jest.spyOn(window, 'scroll')
    polyfill()
    anchor.click()
    expect(spy).not.toHaveBeenCalled()
  })

  it('Returns instance from methods so they are chainable', () => {
    const returnedFromDestroy = destroy()
    const returnedFromPolyfill = polyfill()

    expect(returnedFromDestroy).toBe(SmoothscrollAnchorPolyfill)
    expect(returnedFromPolyfill).toBe(SmoothscrollAnchorPolyfill)
  })

  it('Runs even with native support if force flag is set on window', () => {
    const anchor = insertElement('a', { href: '#' })

    // Mock native support
    document.documentElement.style.scrollBehavior = 'smooth'
    // Set force flag
    window.__forceSmoothscrollAnchorPolyfill__ = true

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalled()
  })

  it('Runs even with native support if force flag is passed as arg', () => {
    const anchor = insertElement('a', { href: '#' })

    // Mock native support
    document.documentElement.style.scrollBehavior = 'smooth'

    const spy = jest.spyOn(window, 'scroll')
    // Pass force flag in options object
    polyfill({ force: true })

    anchor.click()
    expect(spy).toHaveBeenCalled()
  })

  it('Allows force flag passed as arg to override global force flag', () => {
    const anchor = insertElement('a', { href: '#' })

    // Mock native support
    document.documentElement.style.scrollBehavior = 'smooth'
    // Force-enable polyfill with global flag
    window.__forceSmoothscrollAnchorPolyfill__ = true

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    // Should have be called due to global flag
    expect(spy).toHaveBeenCalledTimes(1)
    destroy().polyfill({ force: false })
    anchor.click()
    // Should not have been called again due to override
    expect(spy).toHaveBeenCalledTimes(1)
    window.__forceSmoothscrollAnchorPolyfill__ = false
    destroy().polyfill({ force: true })
    anchor.click()
    // Should have been called again due to override
    expect(spy).toHaveBeenCalledTimes(2)
  })
})

describe('Scroll targeting', () => {
  it('Scrolls to top if target hash is "#top" or "#"', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const anchor = insertElement('a', { href: '#top' })
    const anchorTwo = insertElement('a', { href: '#' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    anchorTwo.click()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('Scrolls to targeted element if anchor targets its ID', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const anchor = insertElement('a', { href: '#target' })
    const target = insertElement('div', { id: 'target' })

    const windowSpy = jest.spyOn(window, 'scroll')
    const spy = jest.spyOn(target, 'scrollIntoView')
    polyfill()

    anchor.click()
    expect(windowSpy).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalled()
  })

  it('Supports (URL-encoded) special characters in the hash', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const specialCharacters = 'emöji―💕'

    // hash automatically encoded to #em%C3%B6ji%E2%80%95%F0%9F%92%95
    const anchor = insertElement('a', { href: `#${specialCharacters}` })
    const target = insertElement('div', { id: specialCharacters })

    const spy = jest.spyOn(target, 'scrollIntoView')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalled()
    expect(location.hash).toMatch(`#${encodeURIComponent(specialCharacters)}`)
  })

  it('Scrolls to element instead of top if hash "#top" targets an ID', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const anchor = insertElement('a', { href: '#top' })
    const target = insertElement('div', { id: 'top' })

    const windowSpy = jest.spyOn(window, 'scroll')
    const spy = jest.spyOn(target, 'scrollIntoView')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalled()
    expect(windowSpy).not.toHaveBeenCalled()
  })
})

describe('Ways to enable/disable', () => {
  it('Can be enabled by computedStyle of fontFamily on html', () => {
    document.documentElement.style.font = '100 1rem "scroll-behavior: smooth"'

    const anchor = insertElement('a', { href: '#' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalled()
  })

  it('Can be enabled through the style attribute on <html>', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const anchor = insertElement('a', { href: '#' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalled()
  })

  it('Can be enabled by documentElement.style.scrollBehavior', () => {
    const anchor = insertElement('a', { href: '#' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    // Only set scrollBehavior after the polyfill ran, so it doesn't bail
    // due to checking for native support ('scrollBehavior' in docEl.style)
    document.documentElement.style.scrollBehavior = 'smooth'

    anchor.click()
    expect(spy).toHaveBeenCalled()
  })

  it('Can be disabled through property with higher specificity', () => {
    // Enabled through regular CSS stylesheet (using getCalculatedStyle)
    document.documentElement.style.font = '100 1rem "scroll-behavior: smooth"'

    const anchor = insertElement('a', { href: '#' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
    // Inline style attribute should overwrite regular CSS and disable
    document.documentElement.setAttribute('style', 'scroll-behavior:auto')
    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
    // Style property should overwrite style attribute, enable again
    document.documentElement.style.scrollBehavior = 'smooth'
    anchor.click()
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('Can be disabled with destroy()', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')
    const anchor = insertElement('a', { href: '#' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
    destroy()
    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('Can be re-enabled with polyfill()', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')
    const anchor = insertElement('a', { href: '#' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
    destroy()
    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
    polyfill()
    anchor.click()
    expect(spy).toHaveBeenCalledTimes(2)
  })
})

describe('Toggling during runtime', () => {
  it('Responds to documentElement.style.scrollBehavior', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const anchor = insertElement('a', { href: '#top' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
    document.documentElement.style.scrollBehavior = 'auto'
    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('Responds to computedStyle of font-family', () => {
    const anchor = insertElement('a', { href: '#top' })

    const spy = jest.spyOn(window, 'scroll')
    polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalledTimes(0)
    document.documentElement.style.font = '100 1rem "scroll-behavior:smooth"'
    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
    document.documentElement.style.font = '100 1rem "scroll-behavior:inherit"'
    anchor.click()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})