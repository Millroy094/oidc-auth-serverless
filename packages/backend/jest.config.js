/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  setupFiles: ['<rootDir>/.jest/set-environment-variables.js'],
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
};
