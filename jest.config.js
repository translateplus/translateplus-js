module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  moduleNameMapper: {
    '^form-data$': '<rootDir>/node_modules/form-data',
    '^node-fetch$': '<rootDir>/node_modules/node-fetch',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(form-data|node-fetch)/)',
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
};
