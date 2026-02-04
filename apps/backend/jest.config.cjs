/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.ts", "**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", {tsconfig: "<rootDir>/tsconfig.test.json"}],
  },
  moduleNameMapper: {
    "^@backend/(.*)$": "<rootDir>/src/$1",
  },
};
