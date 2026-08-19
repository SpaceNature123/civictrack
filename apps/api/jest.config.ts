import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', {
      tsconfig: './tsconfig.json',
      diagnostics: false, // skip type-checking in tests (handled by tsc)
    }],
  },
  moduleNameMapper: {
    '^@civictrack/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testTimeout: 30000,
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
};

export default config;
