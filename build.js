// Reference: https://github.com/souporserious/bundling-typescript-with-esbuild-for-npm

import { build } from 'esbuild'

const shared = {
  bundle: true,
  format: 'esm',
  logLevel: 'info',
  platform: 'browser',
  minify: true,
  sourcemap: true,
  splitting: true,
  target: ['esnext', 'node12.22.0'],
  plugins: [
    {
      name: 'make-all-packages-external',
      setup(build) {
        let filter = /^[^./]|^\.[^./]|^\.\.[^/]/ // Must not start with "/" or "./" or "../"
        build.onResolve({ filter }, (args) => ({
          external: true,
          path: args.path,
        }))
      },
    },
  ],
}

build({
  ...shared,
  entryPoints: ['./src/index.ts'],
  outdir: './dist',
})

// oauth
build({
  ...shared,
  entryPoints: ['./src/oauth/index.ts'],
  outdir: './dist/oauth',
})

// connect
build({
  ...shared,
  entryPoints: ['./src/connect/index.ts'],
  outdir: './dist/connect',
})

/** Rainbowkit */

// oauth
build({
  ...shared,
  entryPoints: ['./src/rainbowkit/oauth/index.ts'],
  outdir: './dist/rainbowkit/oauth',
})

// connect
build({
  ...shared,
  entryPoints: ['./src/rainbowkit/connect/index.ts'],
  outdir: './dist/rainbowkit/connect',
})
