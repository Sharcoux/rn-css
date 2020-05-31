import { AppRegistry, Platform, TouchableOpacity, TouchableOpacityProps } from 'react-native'
import React from 'react'
import { name as appName } from './app.json'
import styled from './src'

const value = 100

const View = styled.View`
  background: green;
  border-radius: 50%;
  width: 200px;
  height: 200px;
`
const Text = styled.Text<{col: string}>`
  color: ${props => props.col || 'black'}
`

const Box = styled.View`
  width: ${value}em;
  max-width: 50vw;
`
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

const HoverableText = styled.Text`
  &:hover {
    fontSize: 2em
  }
`

const Touchable = styled.TouchableOpacity<{pressed: boolean}>`
  background-color: ${props => props.pressed ? 'blue' : 'red'};
`

const Forward = React.forwardRef<typeof TouchableOpacity, TouchableOpacityProps>((props: TouchableOpacityProps, ref) => {
  return <Touchable ref={ref} {...props} pressed={true} />
})
Forward.displayName = 'Forward'

const Button = () => {
  const [pressed, setPressed] = React.useState(false)
  return <Touchable pressed={pressed} onPress={() => setPressed(!pressed)}><Text col={'black'}>Press Me!</Text></Touchable>
}

const App = () => {
  const ref = React.createRef<Text>()
  const ref2 = React.createRef<typeof Box>()
  React.useLayoutEffect(() => console.log(ref), [])
  return (
    <Box ref={ref2}>
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
      <HoverableText>Hover me !</HoverableText>
      <Button />
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
