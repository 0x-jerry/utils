import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/node/index.ts'],
  format: ['esm'],
  sourcemap: true,
  dts: true,
  clean: true,
})
