let config = require('./jest.config');

// Override configs
config.testEnvironment = 'node';

config.collectCoverage = false;

config.testMatch = [
  '<rootDir>/packages/*/__tests__/**/*hehe.spec.@(js|ts)?(x)',
];

// Don't ignore hehe.spec.tsx
config.testPathIgnorePatterns.shift();

config.globals['usingJSDOM'] = false;

config.moduleNameMapper = Object.assign({
  // Hack: fix broken --watch
  '^inferno-transition-group': 'path',
  'mock-document': '<rootDir>/packages/inferno/src/DOM/diff/document.ts',
}, config.moduleNameMapper)

config.setupFiles.push('<rootDir>/scripts/test/mockDocument.ts');

// Override JEST-DEBUG.js. It uses JSDOM to mock document
config.setupFilesAfterEnv = undefined;

config.reporters = [[
  'jest-spec-reporter',
  {}
]];

module.exports = config;