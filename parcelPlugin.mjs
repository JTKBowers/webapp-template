import { isTestFilePath } from '@web/test-runner';
import { Parcel, createWorkerFarm } from '@parcel/core';
import pkg from '@parcel/fs';
const { MemoryFS } = pkg;

import path from 'path';

// TODO: use proper path parsing here instead of a dumb find/replace
const rewritePath = (path) => {
  return path
    .replace('src/', '/dist/')
    .replace('.jsx', '.js')
    .replace('.tsx', '.js')
    .replace('.ts', '.js');
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
      //TODO: fix content-type
      try {
        return {
          body: await outputFS.readFile(rewritePath(request.path), 'utf8'),
          type: 'text/javascript',
        };
      } catch {
        return;
      }
    },
  };
}
