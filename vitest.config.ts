import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    watch: true,
    coverage: {
      provider: 'c8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.ts'],
      reporter: ['clover', 'html-spa'],
    },
  },
})
