// Enable React 19 act support in test renderer
// See: https://react.dev/reference/react/act
global.IS_REACT_ACT_ENVIRONMENT = true

// Mock RNW StyleSheet validation to avoid rejecting test-only properties like 'background'
jest.mock('react-native-web/dist/cjs/exports/StyleSheet/validate', () => ({
  __esModule: true,
  validate: (obj) => obj
}))
