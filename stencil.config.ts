import alias from '@rollup/plugin-alias';
import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

// https://stenciljs.com/docs/config
export const config: Config = {
  globalScript: 'src/global/app.ts',
  globalStyle: 'src/global/app.scss',
  taskQueue: 'async',
  plugins: [
    sass(),
  ],
  outputTargets: [{
    type: 'www',
    serviceWorker: null,
    baseUrl: 'https://tauri.localhost',
    polyfills: true
  },{
    type: 'docs-readme',
    strict: true
  }],
  rollupPlugins: {
    before: [
      alias({
        entries: [
          { find: '@libs/*', replacement: './src/libs/*' },
          { find: 'src/*', replacement: './src/*' },
        ]
      })
    ],
  }
};
