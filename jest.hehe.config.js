let config = require('./jest.config');

// Override configs
config.testMatch = [
  "<rootDir>/packages/*/__tests__/**/*hehe.spec.@(js|ts)?(x)",
];

config.reporters = [[
  "jest-spec-reporter",
  {}
]];

module.exports = config;