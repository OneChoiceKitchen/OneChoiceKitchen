export default {
  displayName: 'frontend-platform',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'jsdom',
  coverageDirectory: '../../coverage/libs/frontend-platform',
};
