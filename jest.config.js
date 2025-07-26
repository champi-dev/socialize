module.exports = {
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/server/tests/setup.js'],
      coverageDirectory: '<rootDir>/coverage/backend',
      collectCoverageFrom: [
        'server/**/*.js',
        '!server/**/*.test.js',
        '!server/index.js'
      ],
      coverageThreshold: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      }
    },
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/**/*.test.{ts,tsx}'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
      },
      setupFilesAfterEnv: ['<rootDir>/client/jest.setup.ts'],
      coverageDirectory: '<rootDir>/coverage/frontend',
      collectCoverageFrom: [
        'client/**/*.{ts,tsx}',
        '!client/**/*.test.{ts,tsx}',
        '!client/**/*.d.ts',
        '!client/next.config.js',
        '!client/tailwind.config.ts',
        '!client/postcss.config.js'
      ],
      coverageThreshold: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      }
    }
  ],
  collectCoverage: true,
  coverageReporters: ['json', 'lcov', 'text', 'html']
};