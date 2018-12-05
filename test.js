const { polyfill } = require('./index')

const insertElement = (type, attrs) => {
  const el = document.createElement(type)
  if (attrs) Object.entries(attrs).forEach(([name, value]) => {
    el[name] = value
  })
  document.body.append(el)
  return el
}

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
  document.head.innerHTML = ''
})

describe('General', () => {
  it('Bails out if scrollBehavior is natively supported', () => {
    const anchor = insertElement('a', { href: '#' })

    // Mock native support
    document.documentElement.style.scrollBehavior = 'smooth'

    const spy = jest.spyOn(window, 'scroll')
    const destroy = polyfill()

    anchor.click()
    expect(spy).not.toHaveBeenCalled()
    destroy()
  })


  it('Runs even in browsers with native support if force flag is set', () => {
    const anchor = insertElement('a', { href: '#' })

    // Mock native support
    document.documentElement.style.scrollBehavior = 'smooth'
    // Set force flag
    window.__forceSmoothscrollAnchorPolyfill__ = true

    const spy = jest.spyOn(window, 'scroll')
    const destroy = polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalled()
    destroy()
  })
})

describe('Scroll targeting', () => {
  it('Scrolls to top if target hash is "#top" or "#"', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const anchor = insertElement('a', { href: '#top' })
    const anchorTwo = insertElement('a', { href: '#' })

    const spy = jest.spyOn(window, 'scroll')
    const destroy = polyfill()

    anchor.click()
    anchorTwo.click()
    expect(spy).toHaveBeenCalledTimes(2)
    destroy()
  })

  it('Scrolls to targeted element if anchor targets its ID', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const anchor = insertElement('a', { href: '#target' })
    const target = insertElement('div', { id: 'target' })

    const windowSpy = jest.spyOn(window, 'scroll')
    const spy = jest.spyOn(target, 'scrollIntoView')
    const destroy = polyfill()

    anchor.click()
    expect(windowSpy).not.toHaveBeenCalled()
    expect(spy).toHaveBeenCalled()
    destroy()
  })

  it('Scrolls to element instead of top if hash "#top" targets an ID', () => {
    document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

    const anchor = insertElement('a', { href: '#top' })
    const target = insertElement('div', { id: 'top' })

    const windowSpy = jest.spyOn(window, 'scroll')
    const spy = jest.spyOn(target, 'scrollIntoView')
    const destroy = polyfill()

    anchor.click()
    expect(spy).toHaveBeenCalled()
    expect(windowSpy).not.toHaveBeenCalled()
    destroy()
  })
})

describe('Enabling & Toggling the polyfill', () => {
  describe('Ways to enable', () => {
    it('Can be enabled by by computedStyle of fontFamily on html', () => {
      document.documentElement.style.font = '100 1rem "scroll-behavior: smooth"'

      const anchor = insertElement('a', { href: '#' })

      const spy = jest.spyOn(window, 'scroll')
      const destroy = polyfill()

      anchor.click()
      expect(spy).toHaveBeenCalled()
      destroy()
    })

    it('Can be enabled through the style attribute on <html>', () => {
      document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

      const anchor = insertElement('a', { href: '#' })

      const spy = jest.spyOn(window, 'scroll')
      const destroy = polyfill()

      anchor.click()
      expect(spy).toHaveBeenCalled()
      destroy()
    })

    it('Can be enabled by documentElement.style.scrollBehavior', () => {
      const anchor = insertElement('a', { href: '#' })

      const spy = jest.spyOn(window, 'scroll')
      const destroy = polyfill()

      // Only set scrollBehavior after the polyfill ran, so it doesn't bail
      // due to checking for native support ('scrollBehavior' in docEl.style)
      document.documentElement.style.scrollBehavior = 'smooth'

      anchor.click()
      expect(spy).toHaveBeenCalled()
      destroy()
    })

    it('Can be disabled through method with higher specificity', () => {
      // Enabled through regular CSS stylesheet (using getCalculatedStyle)
      document.documentElement.style.font = '100 1rem "scroll-behavior: smooth"'

      const anchor = insertElement('a', { href: '#' })

      const spy = jest.spyOn(window, 'scroll')
      const destroy = polyfill()

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
      destroy()
    })
  })

  describe('Toggling during runtime', () => {
    it('Responds to documentElement.style.scrollBehavior', () => {
      document.documentElement.setAttribute('style', 'scroll-behavior:smooth')

      const anchor = insertElement('a', { href: '#top' })

      const spy = jest.spyOn(window, 'scroll')
      const destroy = polyfill()

      anchor.click()
      expect(spy).toHaveBeenCalledTimes(1)
      document.documentElement.style.scrollBehavior = 'auto'
      anchor.click()
      expect(spy).toHaveBeenCalledTimes(1)
      destroy()
    })

    it('Responds to computedStyle of font-family', () => {
      const anchor = insertElement('a', { href: '#top' })

      const spy = jest.spyOn(window, 'scroll')
      const destroy = polyfill()

      anchor.click()
      expect(spy).toHaveBeenCalledTimes(0)
      document.documentElement.style.font = '100 1rem "scroll-behavior:smooth"'
      anchor.click()
      expect(spy).toHaveBeenCalledTimes(1)
      document.documentElement.style.font = '100 1rem "scroll-behavior:inherit"'
      anchor.click()
      expect(spy).toHaveBeenCalledTimes(1)
      destroy()
    })
  })
})