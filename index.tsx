import { AppRegistry, Platform } from 'react-native'
import React from 'react'
import * as RN from 'react-native'
import { name as appName } from './app.json'
import styled from './src'

const View = styled.View``

AppRegistry.registerComponent(appName, () => App)

if (Platform.OS === 'web') {
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementsByTagName('body')[0]
  })
}

const App = () => {
  return (
    <RN.View>
      <RN.Text>Welcome to ReactNativeStyledComponents</RN.Text>
    </RN.View>
  )
}

export default App
