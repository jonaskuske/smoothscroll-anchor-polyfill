<p align="center">
  <a href="https://www.npmjs.com/package/smoothscroll-anchor-polyfill"><img align="center" src="https://img.shields.io/npm/v/smoothscroll-anchor-polyfill.svg" alt="NPM version"></a>
  <a href="https://travis-ci.org/jonaskuske/smoothscroll-anchor-polyfill"><img align="center" src="https://travis-ci.org/jonaskuske/smoothscroll-anchor-polyfill.svg?branch=dev" alt="Build status"></a>
  <a href="./LICENSE"><img align="center" src="https://img.shields.io/npm/l/smoothscroll-anchor-polyfill.svg" alt="License"></a>
</p>  

&nbsp;  
&nbsp;  

<h1 align="center">smoothscroll-anchor-polyfill</h1>
<p align="center">⚓ Apply smooth scroll to anchor links to polyfill the CSS property <code>scroll-behavior</code></p>

&nbsp;  
&nbsp;  

## Browser support
⚠ Requires smooth scroll for `window.scroll()` and `Element.scrollIntoView()` (e.g. [smoothscroll-polyfill](http://iamdustan.com/smoothscroll/)) to work!

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari-ios/safari-ios_48x48.png" alt="iOS Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>iOS Safari | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/opera/opera_48x48.png" alt="Opera" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Opera |
| --------- | --------- | --------- | --------- | --------- | --------- |
| IE9+, Edge| native| native*| last 2 versions| last 2 versions| native*  

> \* hashchange navigation triggered by forwards/backwards buttons isn't smooth despite native support. [Learn more](https://jonaskuske.github.io/smoothscroll-anchor-polyfill#hashchange)


## Usage

### 1. Set `scroll-behavior: smooth` in CSS
> Has to be set global (on `html`), [check the docs for limitations](https://jonaskuske.github.io/smoothscroll-anchor-polyfill#limitations)  

Because CSS properties unknown to a browser can't efficiently be parsed from JavaScript, using normal stylesheets is not enough unfortunately. To specify the property in a way the polyfill can read it, you have two options:
#### 1a. Using inline styles
```html
<html style="scroll-behavior: smooth;">
...
</html>
```

#### 1b. Using `font-family` as workaround
You can specify the property as the name of a custom font family, your actual fonts will still work the way they should. Unlike inline styles, this allows you to use normal CSS features like media queries. The following only enables smooth scroll on desktop devices, for example:
```html
<style>
  html {
    scroll-behavior: instant;
    font-family: 'scroll-behavior: instant;', 'Roboto', sans-serif;
  }
  @media screen and (min-width: 1150px) {
    html {
      scroll-behavior: smooth;
      font-family: 'scroll-behavior: smooth;', 'Roboto', sans-serif;
    }
  }
</style>
```
> This process can also be automated using a [PostCSS plugin](https://github.com/jonaskuske/postcss-smoothscroll-anchor-polyfill), so you can write regular CSS and don't have to bother with font-families. It just works™

### 2. Install the polyfill
Because this polyfill only wires up anchor links with the browser's native `window.scroll()` and `element.scrollIntoView()` methods, you'll need to load a polyfill providing smooth scroll to these methods in addition to the steps outlined below.
> [smoothscroll-polyfill](http://iamdustan.com/smoothscroll/) works, but you can just as well use another one or write your own implementation. [Learn More](https://jonaskuske.github.io/smoothscroll-anchor-polyfill#requirements)
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
import 'smoothscroll-anchor-polyfill';
```
## Full Documentation & Demo

The full documentation with advanced installation instructions, known limitations, features like enabling and disabling the smooth scroll and more can be found at
[**jonaskuske.github.io/smoothscroll-anchor-polyfill**](https://jonaskuske.github.io/smoothscroll-anchor-polyfill).  
The documentation site itself is built as a smooth scrolling one-page design, utilizing this polyfill.

&nbsp;  

___

**PRs welcome!**  
  
  &nbsp;  
  
© 2018, Jonas Kuske
