module.exports = function (api) {
  const isTest = api.env('test')
  return {
    presets: [
      'module:metro-react-native-babel-preset',
      isTest && ['@babel/preset-typescript', { allowDeclareFields: true }]
    ].filter(Boolean)
  }
}
