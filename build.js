// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

import { build } from 'esbuild'
// const { dependencies } = require('./package.json')

const entryFile = 'src/index.ts'
const shared = {
  // bundle: true,
  format: 'esm',
  entryPoints: [entryFile],
  // external: Object.keys(dependencies),
  logLevel: 'info',
  platform: 'browser',
  minify: true,
  sourcemap: true,
  splitting: true,
  target: ['esnext', 'node12.22.0'],
}

// Index
build({
  ...shared,
  format: 'esm',
  outdir: './dist',
})

// oauth
build({
  ...shared,
  entryPoints: ['src/oauth/index.ts'],
  // external: ['@magic-ext/oauth', '@magic-sdk/provider', 'magic-sdk'],
  format: 'esm',
  outdir: './dist/oauth',
})

// connect
build({
  ...shared,
  entryPoints: ['src/connect/index.ts'],
  // external: ['@magic-ext/connect', '@magic-sdk/provider', 'magic-sdk'],
  format: 'esm',
  outdir: './dist/connect',
})

/** Rainbowkit */

// oauth
build({
  ...shared,
  entryPoints: ['src/rainbowkit/oauth/index.ts'],
  // external: ['@magic-ext/oauth', '@magic-sdk/provider', 'magic-sdk'],
  format: 'esm',
  outdir: './dist/rainbowkit/oauth',
})

// connect
build({
  ...shared,
  entryPoints: ['src/rainbowkit/connect/index.ts'],
  // external: ['@magic-ext/connect', '@magic-sdk/provider', 'magic-sdk'],
  format: 'esm',
  outdir: './dist/rainbowkit/connect',
})
