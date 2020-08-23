import React from 'react'
import { AppRegistry, Platform, TouchableOpacity, TouchableOpacityProps } from 'react-native'
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
  top: calc(100% + 2px);
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
const Options = styled.FlatList.attrs<{pressed: boolean}>(props => ({ pressed: props.pressed }))`
  position: absolute;
  top: 100%;
  z-index: 1;
`

const ColorCircle = styled.TouchableOpacity<{color: string; size?: number}>`
  background-color: ${props => props.color};
  width: ${props => props.size || 2}em;
  height: ${props => props.size || 2}em;
  opacity: 1;
  border-radius: 50%;
  &:hover {
    background-color: red;
    opacity: 0.5;
  }
`

const FlatList = () => {
  return <Options data={['teset']} pressed renderItem={({ item }) => (<Text col={'blue'}>{item}</Text>)}/>
}

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
  const ref = React.useRef<Text>(null)
  const ref2 = React.useRef<typeof Box>(null)
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
      <FlatList />
      <ColorCircle color="#236AFF" onLayout={(e) => { console.log(e.nativeEvent.layout) }}/>
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
