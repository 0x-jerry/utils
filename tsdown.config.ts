import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/node/index.ts'],
  format: ['esm'],
  exports: true,
  sourcemap: true,
  clean: true,
})
