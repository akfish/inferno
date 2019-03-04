let config = require('./jest.config');

// Override configs
config.testEnvironment = 'node';

config.collectCoverage = false;

config.testMatch = [
  '<rootDir>/packages/*/__tests__/**/*gamma.spec.@(js|ts)?(x)',
];

// Don't ignore gamma.spec.tsx
config.testPathIgnorePatterns.shift();

config.globals['usingJSDOM'] = false;

config.moduleNameMapper = Object.assign({
  // Hack: fix broken --watch
  '^inferno-transition-group': 'path',
  'mock-document': '<rootDir>/packages/inferno/src/DOM/diff/document.ts',
}, config.moduleNameMapper)

config.setupFiles.push('<rootDir>/scripts/test/mockDocument.ts');

config.snapshotSerializers = [
  '<rootDir>/packages/inferno/__tests__/serializers/vnode.ts',
  '<rootDir>/packages/inferno/__tests__/serializers/diff.ts'
]

// Override JEST-DEBUG.js. It uses JSDOM to mock document
config.setupFilesAfterEnv = undefined;

config.reporters = [[
  'jest-spec-reporter',
  {}
]];

module.exports = config;