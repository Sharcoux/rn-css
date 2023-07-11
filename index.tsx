/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Animated, AppRegistry, Platform, StyleProp, Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native'
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
  box-shadow: 2px 2px 2px red;
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
const Options = styled.FlatList.attrs<{selected: boolean; pressed: boolean}>(props => ({ pressed: props.selected || props.pressed }))`
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
  return <Options data={['teset']} selected pressed renderItem={({ item }) => (<StyledText col={'blue'}>{item}</StyledText>)}/>
}

const Comp = ({ style, text }: { style?: ViewStyle; text: string }) => {
  return <View style={style} >
    <Text>{text}</Text>
  </View>
}
const ExtendedComp = styled(Comp).attrs({ text: 'test' })``
// const ExtendedComp2 = styled(Comp)<{ small: boolean }>`
//   ${props => props.small ? 'font-size: 0.8em' : ''}
// `

const CustomTouchable = styled.TouchableOpacity.attrs<{ extra: string }>({ activeOpacity: 1 })``

const Touchable = styled.TouchableOpacity<{pressed: boolean}>`
  background-color: ${props => props.pressed ? 'blue' : 'red'};
  &:active {
    background-color: purple;
  }
  &:focus {
    background-color: pink;
  }
  &:hover {
    background-color: yellow;
  }
`

const Triangle = styled.View`
  width: 30em;
  height: 30em;
  border-top: 50% solid blue;
  border-left: 50% solid blue;
  border-right: 50% solid transparent;
  border-bottom: 50% solid transparent;
`

// const CustomSelectContainer = styled.TouchableOpacity.attrs({ activeOpacity: 1 })`
//   padding: 2px;
//   margin: 0.2em;
//   border-radius: 0.6em;
//   width: 8em;
//   height: 3.6em;
//   flex-direction: row;
//   background-color: white;
//   border-width: 1px;
//   border-style: solid;
// `

const Forward = React.forwardRef<typeof TouchableOpacity, TouchableOpacityProps>((props: TouchableOpacityProps, ref) => {
  return <Touchable ref={ref} {...props} pressed={true} />
})
Forward.displayName = 'Forward'

const Button = ({ color, style }: { color: string; style?: StyleProp<TextStyle> }) => {
  const [pressed, setPressed] = React.useState(false)
  return <Touchable pressed={pressed} onPress={() => setPressed(!pressed)}><StyledText style={style} col={color}>Press Me!</StyledText></Touchable>
}

const StyledButton = styled(Button).attrs<{ fallbackColor: string }>(({ color: 'black' }))``
const StyledButton2 = styled(Button).attrs(({ color: 'black' }))``

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

  // const LangDropdownItem = styled.View.attrs<{ label: string; value: number }>(
  //   ({ label }) => ({
  //     label: label + 2
  //   })
  // )`
  //   z-index: ${props => props.value + ''};
  // `

  const touchableProps = { activeOpacity: 0 } as TouchableOpacityProps

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
      <StyledButton fallbackColor='white'/>
      <StyledButton2 color='white' />
      <FlatList />
      <Box2 />
      <Triangle />
      <ColorCircle color="#236AFF" onLayout={(e) => { console.log(e.nativeEvent.layout) }}/>
      <Dot style={dotStyle}/>
      <CustomTouchable style={{}} {...touchableProps} activeOpacity={0} extra='test'>
        <ExtendedComp style={{}} text='notest'/>
      </CustomTouchable>
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
