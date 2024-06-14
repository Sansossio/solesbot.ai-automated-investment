const { compilerOptions } = require("./tsconfig.paths.json");

// print current pwd

console.log('Current pwd: ', process.cwd());

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  rootDir: './'
};