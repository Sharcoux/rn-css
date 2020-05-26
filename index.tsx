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

const Box = styled.View``
const Popup = styled.View`
  z-index: 20;
  position: absolute;
  top: 100%;
  background-color: black;
`

const Hoverable = styled.View`
  width: 100px;
  height: 100px;
  background: red;
  &:hover {
    background: blue;
  }
`

const App = () => {
  const ref = React.createRef<typeof Text>()
  React.useLayoutEffect(() => console.log(ref), [])
  return (
    <Box>
      <View>
        <Text ref={ref} col={'red'}>Welcome to ReactNativeStyledComponents</Text>
      </View>
      <Box>
        <Box>
          <Box>
            <Text col={'red'}>Placeholder</Text>
            <Popup>
              <Text col={'green'}>Should be over</Text>
            </Popup>
          </Box>
        </Box>
        <Box>
          <Text col={'red'}>Placeholder</Text>
        </Box>
      </Box>
      <Hoverable>
        <Text col='white'>Hover me !</Text>
      </Hoverable>
    </Box>
  )
}

AppRegistry.registerComponent(appName, () => App)

if (Platform.OS === 'web') {
  AppRegistry.runApplication(appName, {
    rootTag: document.getElementsByTagName('body')[0]
  })
}

export default App
