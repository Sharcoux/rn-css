import { AppRegistry, Platform } from 'react-native'
import React from 'react'
import { name as appName } from './app.json'
import styled from './src'

const View = styled.View``
const Text = styled.Text``

const App = () => {
  return (
    <View>
      <Text>Welcome to ReactNativeStyledComponents</Text>
    </View>
  )
}

AppRegistry.registerComponent(appName, () => App)

if (Platform.OS === 'web') {
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementsByTagName('body')[0]
  })
}

export default App
