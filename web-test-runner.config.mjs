import { playwrightLauncher } from '@web/test-runner-playwright';

process.env.NODE_ENV = 'test';

export default {
  plugins: [],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
};