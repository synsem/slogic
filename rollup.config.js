import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';

import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default {
  entry: 'src/index.js',
  plugins: [
    babel(babelrc({
      config: pkg['babel']
    }))
  ],
  targets: [
    {
      dest: pkg['main'],
      format: 'umd',
      moduleName: pkg['name']
    },
    {
      dest: pkg['jsnext:main'],
      format: 'es'
    }
  ]
};
