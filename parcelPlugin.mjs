import { isTestFilePath } from '@web/test-runner';
import {Parcel, createWorkerFarm} from '@parcel/core';
import pkg from '@parcel/fs';
const { MemoryFS } = pkg;

import path from 'path';


/**
 * Checks whether the url is a virtual file served by @web/test-runner.
 * @param {string} url
 */
function isTestRunnerFile(url) {
  return (
    url.startsWith('/__web-dev-server') || url.startsWith('/__web-test-runner')
  );
}

export default function () {
  let workerFarm;
  let outputFS;
  let bundler, bundleGraph;
  let subscription;

  return {
    name: 'parcel-plugin',
    async serverStart() {
      workerFarm = createWorkerFarm();
      outputFS = new MemoryFS(workerFarm);

      bundler = new Parcel({
        defaultConfig: '@parcel/config-default',
        entries: ["src/App.test.tsx"],
        workerFarm,
        outputFS,
        serveOptions: {
          port: 3000
        },
      });
      await bundler.run();
      subscription = await bundler.watch();
    },
    async serverStop() {
      await subscription.unsubscribe();
    },
    async serve({ request }) {
      if (isTestRunnerFile(request.url)) {
        return;
      }
      const reqPath = request.path;
      if (reqPath.includes("App")) {
        // Parcel rewrites src/App.test.tsx to /dist/App.test.js, so rewrite the path and hardcode the mimetype
        return { body: await outputFS.readFile("/dist/App.test.js", 'utf8'), type: "text/javascript"};
      }
      //TODO: fix
      try {
        return { body: await outputFS.readFile(reqPath.replace("src/", "/dist/"), 'utf8'), type: "text/javascript"};
      } catch {
        return;
      }
    },
  };
}
