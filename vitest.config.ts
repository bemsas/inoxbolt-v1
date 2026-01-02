import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Include test files
    include: ['tests/**/*.test.ts'],

    // Exclude patterns
    exclude: ['node_modules', 'dist'],

    // Timeout for each test (30 seconds for API calls)
    testTimeout: 30000,

    // Reporter
    reporters: ['verbose'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'tests', 'dist', '*.config.*'],
    },

    // Global test settings
    globals: true,
  },
});
