import { playwrightLauncher } from '@web/test-runner-playwright';

import parcelPlugin from './parcelPlugin.mjs';

process.env.NODE_ENV = 'test';

export default {
  plugins: [parcelPlugin()],
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
};
