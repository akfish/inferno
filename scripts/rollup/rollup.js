const { join } = require('path');
const { rollup } = require('rollup');

const createPlugins = require('./plugins');
const applyMock = require('./mock');

const cwd = process.cwd();
const pkgJSON = require(join(cwd, 'package.json'));

module.exports = function(options) {
  const { version, rollup: rollupConfig = {}, dependencies = {}, devDependencies = {}, peerDependencies = {} } = pkgJSON;

  function exclusionFilter(name) {
    return !(rollupConfig.bundledDependencies || []).includes(name);
  }

  // All dependencies are excluded unless specified in bundledDependencies
  const deps = Object.assign({}, devDependencies, peerDependencies, dependencies);
  const external = Object.keys(deps)
    .filter(exclusionFilter)
    .filter(function(elem, index, self) {
      return index === self.indexOf(elem);
    });
  const plugins = createPlugins(version, options);

  return rollup(applyMock(cwd, pkgJSON, options, {
    input: join(cwd, 'src/index.ts'),
    external: external,
    plugins
  }));
};
