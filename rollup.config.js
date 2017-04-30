import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import css from 'rollup-plugin-css-only';
import babel from 'rollup-plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

export default {
  entry: 'src/main.js',
  format: 'iife',
  plugins: [
    css({
      output: 'dist/style.css'
    }),
    json(),
    resolve(),
   babel({
     exclude: 'node_modules/**'
   }),
   serve('dist'),
   livereload()
  ],
  dest: 'dist/bundle.js',
  moduleName: 'melencarte'
};
