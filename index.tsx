/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { Animated, AppRegistry, Platform, StyleProp, Text, TextStyle, TouchableOpacityProps, View as RNView, ViewStyle } from 'react-native'
import { name as appName } from './app.json'
import styled from './src'
/** Consumer path (published .d.ts) — soft-union + attrs bugs show up here, not always via ./src */
import styledDist from './dist'

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
  background: red;
`

const StyledText = styled.Text<{col: string}>`
  color: ${props => props.col || 'black'};
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
    font-size: 2em
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

/** Discriminated union — `never` keeps exclusivity checkable after styled()/attrs(). */
type UnionActionProps =
  | { toRead: string; onPress?: never; style?: ViewStyle }
  | { toRead?: never; onPress: () => void; style?: ViewStyle }

const UnionAction = (props: UnionActionProps) => {
  if ('onPress' in props && props.onPress) {
    return <StyledText style={props.style} col='black' onPress={props.onPress}>Union onPress</StyledText>
  }
  return <StyledText style={props.style} col='black'>{props.toRead}</StyledText>
}

const UnionActionFwd = React.forwardRef<RNView, UnionActionProps>((props, ref) => (
  <RNView ref={ref} style={props.style} onTouchEnd={'onPress' in props ? props.onPress : undefined}>
    <StyledText col='black'>{'toRead' in props ? props.toRead : 'Union forwardRef onPress'}</StyledText>
  </RNView>
))
UnionActionFwd.displayName = 'UnionActionFwd'

const StyledUnionAction = styled(UnionAction).attrs({ style: { opacity: 1 } })`padding: 0.5em;`
const StyledUnionOnly = styled(UnionAction)`padding: 0.5em;`
const StyledUnionFwd = styled(UnionActionFwd)`padding: 0.5em;`
const StyledUnionFwdAttrs = styled(UnionActionFwd).attrs({ style: { opacity: 1 } })`padding: 0.5em;`

/**
 * Soft union like cantoo AudioButton — the other discriminant is absent, not `?: never`.
 * After a non-distributive Omit/Pick collapse, `never`-keyed props still appear in keyof
 * (false green on asserts above). Soft unions lose the keys entirely → real assignability errors.
 */
type SoftUnionProps = {
  name: string
  template: string
  customText?: string
  iconSize?: string
  focusable?: boolean
  style?: ViewStyle
} & ({ toRead: string; onReadingComplete?: () => void } | { onPress: () => void })

const SoftUnionFwd = React.forwardRef<RNView, SoftUnionProps>((props, ref) => (
  <RNView ref={ref} style={props.style}>
    <StyledText col='black'>
      {'toRead' in props ? props.toRead : 'soft onPress'}
    </StyledText>
  </RNView>
))
SoftUnionFwd.displayName = 'SoftUnionFwd'

/**
 * Mirrors cantoo withPulsation: infer props, then assert ForwardRefExoticComponent with
 * RefAttributes embedded in the props type parameter (same shape that breaks .attrs()).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withPulse = <C extends React.ComponentType<any>>(Component: C) => {
  type P = C extends React.ComponentType<infer Props> ? Props : never
  // Cast: React 19 forwardRef + soft-union P trips PropsWithoutRef; this helper only shapes types for asserts below.
  const Pulsed = React.forwardRef((() => null) as any)
  Pulsed.displayName = 'WithPulse'
  return Pulsed as React.ForwardRefExoticComponent<
    P & { animated?: boolean } & React.RefAttributes<RNView>
  >
}

const SoftPulsed = withPulse(SoftUnionFwd)

const StyledSoftOnly = styled(SoftUnionFwd)`padding: 0.5em;`
const StyledSoftAttrs = styled(SoftUnionFwd).attrs({ style: { opacity: 1 } })`padding: 0.5em;`
/**
 * Repro via published typings (./dist), matching cantoo's import of `rn-css`.
 * ./src can preserve the union while the emitted .d.ts + .attrs() collapses it.
 */
const StyledSoftAttrsEmpty = styledDist(SoftPulsed).attrs({})`
  padding: 0.5em;
`
/** Same attrs shape as cantoo PlayButton */
const StyledSoftPlay = styledDist(SoftPulsed).attrs({
  name: 'audioButton',
  template: 'purpleButton',
  customText: '',
  iconSize: '4em',
  focusable: false
})`
  border-radius: 50%;
`

/** Compile-time: both branches kept (FC + forwardRef), exclusive combo rejected. */
type UnionBranches<P> = P extends unknown
  ? (P extends { toRead: string } ? 'toRead' : P extends { onPress: () => void } ? 'onPress' : 'other')
  : never
type AssertUnionPreserved<P> = UnionBranches<P> extends 'toRead' | 'onPress'
  ? ('toRead' | 'onPress' extends UnionBranches<P> ? true : never)
  : never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AssertStyledUnion<C extends React.ComponentType<any>> = AssertUnionPreserved<React.ComponentProps<C>>

const _assertOnly: AssertStyledUnion<typeof StyledUnionOnly> = true
const _assertAttrs: AssertStyledUnion<typeof StyledUnionAction> = true
const _assertFwd: AssertStyledUnion<typeof StyledUnionFwd> = true
const _assertFwdAttrs: AssertStyledUnion<typeof StyledUnionFwdAttrs> = true
// @ts-expect-error exclusivity — both discriminants together must be rejected
const _badOnly: React.ComponentProps<typeof StyledUnionOnly> = { toRead: 'x', onPress: () => undefined }
// @ts-expect-error exclusivity
const _badAttrs: React.ComponentProps<typeof StyledUnionAction> = { toRead: 'x', onPress: () => undefined }
// @ts-expect-error exclusivity
const _badFwd: React.ComponentProps<typeof StyledUnionFwd> = { toRead: 'x', onPress: () => undefined }
// @ts-expect-error exclusivity
const _badFwdAttrs: React.ComponentProps<typeof StyledUnionFwdAttrs> = { toRead: 'x', onPress: () => undefined }

/**
 * Soft-union assignability (AudioButton / PlayButton-shaped).
 * StyledSoftOnly should pass; StyledSoftAttrsEmpty / StyledSoftPlay currently fail when
 * .attrs() return type goes through forwardRef's PropsWithoutRef without the styled() cast.
 */
const _softOnlyToRead: React.ComponentProps<typeof StyledSoftOnly> = { name: 'n', template: 't', toRead: 'x' }
const _softOnlyOnPress: React.ComponentProps<typeof StyledSoftOnly> = { name: 'n', template: 't', onPress: () => undefined }
const _softAttrsToRead: React.ComponentProps<typeof StyledSoftAttrs> = { name: 'n', template: 't', toRead: 'x' }
const _softAttrsOnPress: React.ComponentProps<typeof StyledSoftAttrs> = { name: 'n', template: 't', onPress: () => undefined }
const _softEmptyToRead: React.ComponentProps<typeof StyledSoftAttrsEmpty> = {
  name: 'n',
  template: 't',
  toRead: 'x'
}
const _softEmptyOnPress: React.ComponentProps<typeof StyledSoftAttrsEmpty> = {
  name: 'n',
  template: 't',
  onPress: () => undefined
}
const _softPlayToRead: React.ComponentProps<typeof StyledSoftPlay> = { toRead: 'x' }
const _softPlayOnPress: React.ComponentProps<typeof StyledSoftPlay> = { onPress: () => undefined }

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
  width: 10em;
  height: 10em;
  border-top: 50% solid blue;
  border-left: 50% solid blue;
  border-right: 50% solid transparent;
  border-bottom: 50% solid transparent;
`

const Forward = React.forwardRef<RNView, TouchableOpacityProps>((props, ref) => {
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
  const ref2 = React.useRef<RNView>(null)
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
      <StyledUnionAction toRead='hello from union' />
      <StyledUnionAction onPress={() => console.log('union press')} />
      <StyledUnionOnly toRead='hello styled only' />
      <StyledUnionOnly onPress={() => console.log('styled only press')} />
      <StyledUnionFwd toRead='hello forwardRef union' />
      <StyledUnionFwd onPress={() => console.log('forwardRef union press')} />
      <StyledUnionFwdAttrs toRead='hello forwardRef attrs' />
      <StyledUnionFwdAttrs onPress={() => console.log('forwardRef attrs press')} />
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
