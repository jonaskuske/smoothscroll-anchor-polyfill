import * as utils from '../src/utils.js'

jest.mock('../src/utils.js', () => ({
  ...jest.requireActual('../src/utils.js'),
  hasNativeSupport: jest.fn(() => false),
}))

const inserted = []

export function setupBrowserEnv() {
  beforeEach(() => {
    window.scroll = jest.fn()
    Element.prototype.scrollIntoView = jest.fn()
  })

  afterEach(() => {
    utils.hasNativeSupport.mockReset()
    delete window.__forceSmoothscrollAnchorPolyfill__
    document.documentElement.removeAttribute('style')
    inserted.forEach((el) => el.remove())
  })
}

export const mockNativeSupport = () => {
  utils.hasNativeSupport.mockReturnValue(true)
}

/** @param {string} attr  */
export const setStyleAttr = (attr) => {
  document.documentElement.setAttribute('style', attr)
}

/**
 * @template {keyof HTMLElementTagNameMap} TagName
 * @param {TagName} tagName
 * @param {Partial<HTMLElementTagNameMap[TagName]>} [props]
 * @param {boolean} [head=false]
 */
export const insertElement = (tagName, props, head = false) => {
  const el = document.createElement(tagName)
  if (props) Object.entries(props).forEach(([key, val]) => (el[key] = val))
  inserted.push(el)
  return document[head ? 'head' : 'body'].appendChild(el)
}

/** @param {Partial<HTMLElementTagNameMap['a']>} [props] */
export const insertAnchor = (props = { href: '#' }) => insertElement('a', props)
