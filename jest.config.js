/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    // Данные и CLI-скрипты вне серверного пути не входят в покрытие:
    // generated/data — литералы знаний, parser — генераторы знаний (npm run parse:*),
    // index.ts — точка входа stdio-сервера.
    '!src/generated/**',
    '!src/data/**',
    '!src/tools/parser/**',
    '!src/index.ts'
  ],
  coverageDirectory: 'coverage',
  // Пороги-«трещотки»: зафиксировано чуть ниже текущих значений, чтобы CI
  // ловил регресссы, не требуя немедленно закрывать legacy-пробелы.
  // При росте покрытия подтягивайте числа вверх.
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 72,
      lines: 70
    },
    'src/utils/**': {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90
    }
  },
  verbose: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true
      }
    }]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};
