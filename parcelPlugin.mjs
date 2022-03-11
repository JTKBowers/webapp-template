import { isTestFilePath } from '@web/test-runner';
import { Parcel, createWorkerFarm } from '@parcel/core';
import pkg from '@parcel/fs';
const { MemoryFS } = pkg;

import path from 'path';

// TODO: use proper path parsing here instead of a dumb find/replace
const rewritePath = (path) => {
  return path
    .replace('src/', 'dist/')
    .replace('.jsx', '.js')
    .replace('.tsx', '.js')
    .replace('.ts', '.js');
};

// TODO: use a proper package for this
const getMimeTypeFromExtension = (fileExtension) => {
  return {
    js: 'application/javascript',
    png: 'image/png',
  }[fileExtension];
};
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
        entries: ['src/App.test.tsx'],
        workerFarm,
        outputFS,
        serveOptions: {
          port: 3000,
        },
      });
      await new Promise(async (resolve, reject) => {
        subscription = await bundler.watch((err, event) => {
          if (err) reject(err);
          if (event && event.type === 'buildSuccess') {
            bundleGraph = event.bundleGraph;
            resolve();
          }
        });
      });
    },
    async serverStop() {
      await subscription.unsubscribe();
    },
    async serve({ request }) {
      if (isTestRunnerFile(request.url)) {
        return;
      }

      const parcelPath = rewritePath(request.path);

      // Get the bundle to work out its mime type. Could potentially also just go off the file path?
      const bundle = bundleGraph
        .getBundles()
        .find((bundle) => bundle.filePath == parcelPath);
      if (!bundle) return;

      try {
        return {
          body: await outputFS.readFile(parcelPath, 'utf8'),
          type: getMimeTypeFromExtension(bundle.type),
        };
      } catch {
        return;
      }
    },
  };
}
