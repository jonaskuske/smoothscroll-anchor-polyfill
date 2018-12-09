/**
 * @jest-environment node
 */

describe('SSR', () => {
  it('Does not throw on require() in Node environment', () => {
    const fn = () => {
      require('../index')
    }

    expect(fn).not.toThrow()
  })

  it('Returns instance from methods so they are chainable', () => {
    const SmoothscrollAnchorPolyfill = require('../index')
    const returnedFromDestroy = SmoothscrollAnchorPolyfill.destroy()
    const returnedFromPolyfill = SmoothscrollAnchorPolyfill.polyfill()

    expect(returnedFromDestroy).toBe(SmoothscrollAnchorPolyfill)
    expect(returnedFromPolyfill).toBe(SmoothscrollAnchorPolyfill)
  })
})
