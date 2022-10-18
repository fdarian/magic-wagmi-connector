// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

import { build } from 'esbuild'
import pkg from './package.json' assert { type: 'json' }

const shared = {
  bundle: true,
  format: 'esm',
  logLevel: 'info',
  platform: 'browser',
  minify: true,
  sourcemap: true,
  splitting: true,
  target: ['esnext', 'node12.22.0'],
}

build({
  ...shared,
  entryPoints: ['./src/index.ts'],
  external: Object.keys(pkg.dependencies),
  outdir: './dist',
})

// oauth
build({
  ...shared,
  entryPoints: ['./src/oauth/index.ts'],
  external: ['@magic-ext/oauth', '@magic-sdk/provider', 'magic-sdk'],
  outdir: './dist/oauth',
})

// connect
build({
  ...shared,
  entryPoints: ['./src/connect/index.ts'],
  external: ['@magic-ext/connect', '@magic-sdk/provider', 'magic-sdk'],
  outdir: './dist/connect',
})

/** Rainbowkit */

// oauth
build({
  ...shared,
  entryPoints: ['./src/rainbowkit/oauth/index.ts'],
  external: ['@magic-ext/oauth', '@magic-sdk/provider', 'magic-sdk'],
  outdir: './dist/rainbowkit/oauth',
})

// connect
build({
  ...shared,
  entryPoints: ['./src/rainbowkit/connect/index.ts'],
  external: ['@magic-ext/connect', '@magic-sdk/provider', 'magic-sdk'],
  outdir: './dist/rainbowkit/connect',
})
