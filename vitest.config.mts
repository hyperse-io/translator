import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 100000,
    exclude: [...configDefaults.exclude],
    coverage: {
      provider: 'istanbul', // or 'v8'
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: ['text', 'json-summary', 'json'],
      include: ['src/**', 'test-assets/**'],
      // If you want a coverage reports even if your tests are failing, include the reportOnFailure option
      reportOnFailure: true,
    },
    include: ['**/?(*.){test,spec}.?(c|m)[jt]s?(x)'],
  },
});
