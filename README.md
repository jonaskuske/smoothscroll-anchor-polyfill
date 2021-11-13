<p align="center">
  <a href="https://www.npmjs.com/package/smoothscroll-anchor-polyfill"><img align="center" src="https://img.shields.io/npm/v/smoothscroll-anchor-polyfill.svg" alt="NPM version"></a>
  <a href="https://travis-ci.com/jonaskuske/smoothscroll-anchor-polyfill"><img align="center" src="https://travis-ci.com/jonaskuske/smoothscroll-anchor-polyfill.svg?branch=master" alt="Build status"></a>
  <a href="./LICENSE"><img align="center" src="https://img.shields.io/npm/l/smoothscroll-anchor-polyfill.svg" alt="License"></a>
  <a href="https://jonaskuske.github.io/smoothscroll-anchor-polyfill"><img align="center" src="https://img.shields.io/badge/documentation-up--to--date-blue.svg" alt="Documentation"></a>
</p>

&nbsp;  
&nbsp;

<h1 align="center">smoothscroll-anchor-polyfill</h1>
<p align="center">⚓ Apply smooth scroll to anchor links to polyfill the CSS property <code>scroll-behavior</code></p>

&nbsp;  
&nbsp;  
&nbsp;

## Features

- ✔ Smooth scroll to target when clicking an anchor
- ✔ Smooth scroll to target on hashchange (◀/▶ buttons)
- ✔ Updates URL with #fragment
- ✔ Handles focus for improved accessibility
- ✔ Doesn't break server-side rendering
- ✔ 1.3KB gzipped

⚠ Requires smooth scroll for `window.scroll()` and `Element.scrollIntoView()` (e.g. [smoothscroll-polyfill](http://iamdustan.com/smoothscroll/)) to work!

&nbsp;

## Browser support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IE9+, Edge                                                                                                                                                                                                      | native                                                                                                                                                                                                            | native\*                                                                                                                                                                                                      | last 2 versions                                                                                                                                                                                               | last 2 versions                                                                                                                                                                                                               | native\*                                                                                                                                                                                                  |

> \* hashchange navigation triggered by forwards/backwards buttons isn't smooth despite native support. [Learn more](https://jonaskuske.github.io/smoothscroll-anchor-polyfill#native-inconsistencies)

&nbsp;

## Usage

### 1. Set `scroll-behavior: smooth` in CSS

> ⚠ Has to be set global (on `html`), [check the docs for limitations](https://jonaskuske.github.io/smoothscroll-anchor-polyfill#global-only)

&nbsp;

Because CSS properties unknown to a browser can't efficiently be parsed from JavaScript, just specyfing the normal `scroll-behavior` property is not enough unfortunately.  
You need to add an additional CSS variable so the polyfill can read it:

```css
html {
  --scroll-behavior: smooth;
  scroll-behavior: smooth;
}
```

You can also use media queries, toggle classes etc. to control the smooth scroll. The following only enables smooth scroll on Desktop devices, for example:

```css
html {
  --scroll-behavior: auto;
  scroll-behavior: auto;
}

@media screen and (min-width: 1150px) {
  html {
    --scroll-behavior: smooth;
    scroll-behavior: smooth;
  }
}
```

&nbsp;

> 💡 This process can be automated using a [PostCSS plugin](https://github.com/jonaskuske/postcss-smoothscroll-anchor-polyfill), so you can write regular CSS and it'll be transformed to work with the polyfill automatically.  
> The plugin will also read your [browserslist](https://github.com/browserslist/browserslist) and choose the right transformation depending on if all your browsers support CSS variables or not. It just works™

&nbsp;

#### Need to support Internet Explorer?

Legacy browsers like Internet Explorer do not support CSS variables, so you need another way to specify `scroll-behavior`. There are two options:

##### Using the inline `style` attribute

```html
<html style="scroll-behavior: smooth;">
  ...
</html>
```

##### Using `font-family`

Alternatively, you can specify the property as the name of a custom font family. Your actual fonts will still work the way they should (plus, you can simply declare actual fonts on `body`). As with CSS variables (and unlike inline styles), this allows you to use normal CSS features like media queries.

```html
<style>
  html {
    scroll-behavior: auto;
    font-family: 'scroll-behavior: auto;', 'Roboto', sans-serif;
  }
</style>
```

&nbsp;

### 2. Install the polyfill

Because this polyfill only wires up anchor links to use the browser's native `window.scroll()` and `element.scrollIntoView()` methods, you'll need to load a polyfill providing smooth scroll to these methods **in addition to the steps outlined below**.

> [smoothscroll-polyfill](http://iamdustan.com/smoothscroll/) works, but you can just as well use another one or write your own implementation. [Learn More](https://jonaskuske.github.io/smoothscroll-anchor-polyfill#usage)

#### 2a. From a CDN

```html
<script src="https://unpkg.com/smoothscroll-anchor-polyfill"></script>
```

#### 2b. From npm

```bash
npm install smoothscroll-anchor-polyfill
```

then

```js
import 'smoothscroll-anchor-polyfill'
```

&nbsp;

## Full Documentation & Demo

The full documentation with advanced installation instructions, limitations, features like enabling and disabling the smooth scrolling and more can be found at
[**jonaskuske.github.io/smoothscroll-anchor-polyfill**](https://jonaskuske.github.io/smoothscroll-anchor-polyfill).  
The documentation site itself is built as a smooth scrolling one-page design, utilizing this polyfill.

&nbsp;  
&nbsp;

---

**PRs welcome!**

&nbsp;

© 2021, Jonas Kuske
