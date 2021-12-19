import { playwrightLauncher } from '@web/test-runner-playwright';
import snowPackPlugin from '@snowpack/web-test-runner-plugin';

process.env.NODE_ENV = 'test';

export default {
  plugins: [snowPackPlugin()],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
};