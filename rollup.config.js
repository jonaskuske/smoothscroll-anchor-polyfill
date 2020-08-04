/* eslint-env node */

import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'
import { getBabelOutputPlugin } from '@rollup/plugin-babel'
import pkg from './package.json'

process.env.NODE_ENV = 'production'

const banner = `/** @license MIT smoothscroll-anchor-polyfill@${pkg.version} (c) 2020 Jonas Kuske */`

const esmPreset = ['@babel/preset-env', { targets: { esmodules: true }, bugfixes: true }]

export default {
  plugins: [filesize({ showMinifiedSize: false })],
  input: 'src/index.js',
  output: [
    {
      banner,
      file: pkg.module,
      plugins: [getBabelOutputPlugin({ presets: [esmPreset] })],
    },
    {
      // banner,
      file: pkg.module.replace(/\.mjs$/, '.min.mjs'),
      plugins: [getBabelOutputPlugin({ presets: [esmPreset] }), terser()],
    },
    {
      banner,
      file: pkg.main,
      plugins: [getBabelOutputPlugin(pkg.babel)],
    },
    {
      // banner,
      file: pkg.main.replace(/\.js$/, '.min.js'),
      plugins: [getBabelOutputPlugin(pkg.babel), terser()],
    },
  ],
}
