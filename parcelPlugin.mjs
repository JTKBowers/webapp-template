import { isTestFilePath } from '@web/test-runner';
import {Parcel, createWorkerFarm} from '@parcel/core';
import pkg from '@parcel/fs';
const { MemoryFS } = pkg;
// import { MemoryFS } from '@parcel/fs';

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
  // let server, config;
  let workerFarm;
  let outputFS;
  let bundler, bundleGraph;

  return {
    name: 'parcel-plugin',
    async serverStart() {
      workerFarm = createWorkerFarm();
      outputFS = new MemoryFS(workerFarm);

      bundler = new Parcel({
        defaultConfig: '@parcel/config-default',
        entries: "src/App.test.tsx",
        workerFarm,
        outputFS
      });
      console.log("a");
      bundleGraph = await bundler.run();
    },
    // async serverStart({ fileWatcher }) {
    //   console.log('I am a plugin');
    //   // TODO: load project config
    //   // config = await snowpack.loadConfiguration({
    //   //   mode: 'test',
    //   //   packageOptions: { external: ['/__web-dev-server__web-socket.js'] },
    //   //   devOptions: { open: 'none', output: 'stream', hmr: false },
    //   // });
    //   // npm packages should be installed/prepared ahead of time.
    //   console.log('[parcel] starting server...');
    //   console.log(fileWatcher.getWatched());
    //   // fileWatcher.add(Object.keys(config.mount));
    //   // server = await snowpack.startServer({
    //   //   config,
    //   //   lockfile: null,
    //   // });
    //   bundler = new Parcel({
    //     entries: 'a.js',
    //     defaultConfig: '@parcel/config-default'
    //   });
    // },
    // async serverStop() {
    //   return server.shutdown();
    // },
    // async serve({ request }) {
    //   if (isTestRunnerFile(request.url)) {
    //     return;
    //   }
    //   const reqPath = request.path;
    //   try {
    //     const result = await server.loadUrl(reqPath, { isSSR: false });
    //     return { body: result.contents, type: result.contentType };
    //   } catch {
    //     return;
    //   }
    // },
    async transformImport({ source }) {
      if (!isTestFilePath(source) || isTestRunnerFile(source)) {
        return;
      }
      // PERF(fks): https://github.com/withastro/snowpack/pull/1259/files#r502963818
      const reqPath = source.substring(
        0,
        source.indexOf('?') === -1 ? undefined : source.indexOf('?'),
      );
      const sourcePath = path.join(process.cwd(), reqPath);

      
      console.log("a");
      // let bundles = bundleGraph.getBundles();
      // console.log(`✨ Built ${bundles.length} bundles in ${buildTime}ms!`);
      // let {bundleGraph} = await bundler.run();

      for (let bundle of bundleGraph.getBundles()) {
        console.log(bundle.filePath);
        return { body: await outputFS.readFile(bundle.filePath, 'utf8')};
      }
      try {
        return;
      } catch {
        return;
      }
    },
  };
}
