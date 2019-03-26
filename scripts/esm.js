const fs = require('fs')
const path = require('path')

// Get original, non-ESM code
const originalCode = fs.readFileSync(
  path.resolve(__dirname, '../', 'index.js'),
  { encoding: 'utf8' }
)

// Transform CommonJS/universal code into ESM code.
// We provide an Object as thisArg and tell the script to bind
// to it (even if run in CommonJS env) through a special property.
// Then we export the polyfill now bound to the provided Object.
const esmCode = `const rootObj = { __sap_ES_MODULE__: true };
(function() {
  ${originalCode}
}).call(rootObj);

const { SmoothscrollAnchorPolyfill } = rootObj;
const { destroy, polyfill } = SmoothscrollAnchorPolyfill;

export { destroy, polyfill };
export default SmoothscrollAnchorPolyfill;`

// Write ESM code to directory "dist"
fs.writeFileSync(path.resolve(__dirname, '../', 'dist', 'index.mjs'), esmCode, 'utf8')
