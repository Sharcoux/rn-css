/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Animated, AppRegistry, Platform, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native'
import { name as appName } from './app.json'
import styled from './src'

const value = 100

const View = styled.View`
  background: green;
  border-radius: 50%;
  width: 200px;
  height: 200px;
`

const Dot = styled(Animated.View)`
  width: 5em;
  height: 5em;
  margin: 2em;
  border-radius: 50%;
  z-index: 10;
`

const StyledText = styled.Text<{col: string}>`
  color: ${props => props.col || 'black'}
  font-size: 1em;
  @media (max-width: 40em) {
    color: blue;
    font-size: 2em;
  }
  @media (max-width: 20em) {
    color: red;
    font-size: 3em;
  }
`

const Box = styled.View`
  width: ${value}em;
  max-width: 50vw;
`
const Box2 = styled.View`
  width: 100vw;
  height: 2em;
  background: blue;
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
const Options = styled.FlatList.attrs<{selected: boolean; pressed: boolean}>(props => ({ pressed: props.selected }))`
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
  return <Options data={['teset']} pressed renderItem={({ item }) => (<StyledText col={'blue'}>{item}</StyledText>)}/>
}

const Comp = ({ style, text }: { style?: ViewStyle; text: string }) => {
  return <View style={style} >
    <Text>{text}</Text>
  </View>
}
const ExtendedComp = styled(Comp).attrs({ text: 'test' })``

const Touchable = styled.TouchableOpacity<{pressed: boolean}>`
  background-color: ${props => props.pressed ? 'blue' : 'red'};
`

const Forward = React.forwardRef<typeof TouchableOpacity, TouchableOpacityProps>((props: TouchableOpacityProps, ref) => {
  return <Touchable ref={ref} {...props} pressed={true} />
})
Forward.displayName = 'Forward'

const Button = () => {
  const [pressed, setPressed] = React.useState(false)
  return <Touchable pressed={pressed} onPress={() => setPressed(!pressed)}><StyledText col={'black'}>Press Me!</StyledText></Touchable>
}

const App = () => {
  const ref = React.useRef<Text>(null)
  const ref2 = React.useRef<typeof Box>(null)
  React.useLayoutEffect(() => console.log(ref), [])
  const dotLeft = React.useRef(new Animated.Value(0))
  const dotStyle: Animated.WithAnimatedValue<ViewStyle> = React.useMemo(
    () => ({
      left: dotLeft.current.interpolate({
        inputRange: [0, 50],
        outputRange: ['0%', '50%']
      })
    }),
    []
  )

  const LangDropdownItem = styled.View.attrs<{ label: string; value: number }>(
    ({ label }) => ({
      label: label + 2
    })
  )`
    z-index: ${props => props.value + ''};
  `

  return (
    <Box ref={ref2}>
      <View style={{ flexDirection: 'column' }}>
        <StyledText ref={ref} col={'black'} numberOfLines={1} style={{ flexGrow: 1, flexBasis: 'auto' }}>Welcome to ReactNativeStyledComponents</StyledText>
      </View>
      <Box>
        <Box>
          <Box>
            <StyledText col={'red'}>Placeholder</StyledText>
            <Popup>
              <StyledText col={'green'}>Should be over</StyledText>
            </Popup>
          </Box>
        </Box>
        <Box>
          <StyledText col={'red'}>Placeholder</StyledText>
        </Box>
      </Box>
      <Hoverable>
        <StyledText col='white'>Hover me !</StyledText>
      </Hoverable>
      <HoverableText>Hover me !</HoverableText>
      <Button />
      <FlatList />
      <Box2 />
      <ColorCircle color="#236AFF" onLayout={(e) => { console.log(e.nativeEvent.layout) }}/>
      <Dot style={dotStyle}/>
      <ExtendedComp style={{}}/>
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
