const fn = require('funclib');
const path = require('path');
const webpack = require('webpack');
const config = require('./webpack.conf');

const root = path.dirname(__dirname);
const fnMinJs = path.join(root, 'dist/funclib.min.js');
const DtsDist = path.join(root, 'dist/funclib.d.ts');
const indexDist = path.join(root, 'dist/index.js');
const pkgDist = path.join(root, 'dist/package.json');
const rdmeDist = path.join(root, 'dist/README.md');
const DtsSrc = path.join(root, 'src/assets/funclib.d.ts');
const indexSrc = path.join(root, 'src/assets/index.js');
const pkgSrc = path.join(root, 'src/assets/package.json');
const rdmeSrc = path.join(root, 'README.md');

const srcs = [DtsSrc, indexSrc, pkgSrc, rdmeSrc];
const dists = [DtsDist, indexDist, pkgDist, rdmeDist, fnMinJs];
dists.forEach(f => fn.rm(f));
srcs.forEach((f, i) => fn.cp(f, dists[i]));

fn.progress.start({title: 'Compiling Funclib', width: 41});
webpack(config, function (err, stats) {
  if (err) throw (err);
  fn.progress.stop(() => {
    buildFix();
    fn.log('', {part: 'pre'});
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n');
    fn.log('', {part: 'end'});
  });
});

function buildFix() {
  const funclibMin = fn.rd(fnMinJs);
  const idx = '!function('.length;
  const rt = funclibMin.substr(idx, 1);
  const ft = funclibMin.substr(idx + 2, 1);
  const it = `new (${ft}().Funclib)(${rt})`;
  const newFnMin = funclibMin
    .replace(new RegExp(`module\.exports=${ft}\\(\\)`), `module.exports=${it}`)
    .replace(new RegExp(`define\\(\\[\\],${ft}\\)`), `define([${rt}], function(${rt}) {${it}})`)
    .replace(new RegExp(`\.fn=${ft}\\(\\)`, 'mg'), `.fn=${it}`);
  fn.wt(fnMinJs, newFnMin);
}
