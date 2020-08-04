/** @jest-environment node */

describe('SSR', () => {
  it('Does not throw on require() in Node environment', () => {
    const fn = () => require('../src/index.js')

    expect(fn).not.toThrow()
  })

  it('Returns instance from methods so they are chainable', () => {
    const { default: SmoothscrollAnchorPolyfill } = require('../src/index.js')
    const returnedFromDestroy = SmoothscrollAnchorPolyfill.destroy()
    const returnedFromPolyfill = SmoothscrollAnchorPolyfill.polyfill()

    expect(returnedFromDestroy).toBe(SmoothscrollAnchorPolyfill)
    expect(returnedFromPolyfill).toBe(SmoothscrollAnchorPolyfill)
  })
})
