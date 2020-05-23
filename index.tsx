import { AppRegistry, Platform } from 'react-native'
import React from 'react'
import { name as appName } from './app.json'
import styled from './src'

const View = styled.View`
  background: green;
  border-radius: 50%;
  width: 200px;
  height: 200px;
`
const Text = styled.Text<{col: string}>`
  color: ${props => props.col || 'black'}
`

const App = () => {
  return (
    <View>
      <Text col={'red'}>Welcome to ReactNativeStyledComponents</Text>
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
