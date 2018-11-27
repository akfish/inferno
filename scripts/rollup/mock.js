const injectPlugin = require('rollup-plugin-inject');
const { resolve } = require('path');

// Resolve relative paths against cwd
function resolvePaths(cwd, pathMap) {
  let resolved = {};

  Object.keys(pathMap).map((key) => resolved[key] = resolve(cwd, pathMap[key]));

  return resolved;
}

function inject(cwd, mockOpts, rollupOpts) {
  if (!mockOpts.inject) return rollupOpts;
  const injectPluginInstance = injectPlugin(resolvePaths(cwd, mockOpts.inject));

  rollupOpts.plugins.push(injectPluginInstance);
  return rollupOpts;
}

module.exports = function applyMock(cwd, pkgJSON, cliOpts, rollupOps) {
  // No mock, return original options
  if (!pkgJSON.mock || !cliOpts.mock) return rollupOps;

  return inject(cwd, pkgJSON.mock, rollupOps);
}