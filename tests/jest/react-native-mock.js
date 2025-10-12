/* eslint-disable @typescript-eslint/no-var-requires */
const React = require('react')

const View = 'View'
const Text = 'Text'
const ActivityIndicator = 'ActivityIndicator'
const DrawerLayoutAndroid = 'DrawerLayoutAndroid'
const Image = 'Image'
const ImageBackground = 'ImageBackground'
const KeyboardAvoidingView = 'KeyboardAvoidingView'
const Modal = 'Modal'
const ScrollView = 'ScrollView'
const Switch = 'Switch'
const RefreshControl = 'RefreshControl'
const SafeAreaView = 'SafeAreaView'
const TextInput = 'TextInput'
const TouchableHighlight = 'TouchableHighlight'
const TouchableNativeFeedback = 'TouchableNativeFeedback'
const TouchableOpacity = 'TouchableOpacity'
const TouchableWithoutFeedback = 'TouchableWithoutFeedback'

const StyleSheet = {
  create: (obj) => obj,
  flatten: (style) => {
    if (!style) return {}
    // Arrays
    if (Array.isArray(style)) return Object.assign({}, ...style.map(StyleSheet.flatten))
    // Objects with numeric keys (0,1,...) – flatten like an array
    if (typeof style === 'object') {
      const numericKeys = Object.keys(style).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b))
      if (numericKeys.length) {
        return Object.assign({}, ...numericKeys.map(k => StyleSheet.flatten(style[k])))
      }
    }
    return style
  }
}

const _listeners = []
const Dimensions = {
  _state: { width: 1000, height: 1000 },
  get: () => ({ width: Dimensions._state.width, height: Dimensions._state.height }),
  addEventListener: (type, listener) => {
    _listeners.push(listener)
    return { remove: () => { const i = _listeners.indexOf(listener); if (i >= 0) _listeners.splice(i, 1) } }
  }
}

const useWindowDimensions = () => {
  const [dims, setDims] = React.useState(Dimensions.get('window'))
  React.useEffect(() => {
    const handler = () => setDims(Dimensions.get('window'))
    const sub = Dimensions.addEventListener && Dimensions.addEventListener('change', handler)
    return () => sub && sub.remove && sub.remove()
  }, [])
  return dims
}

const PixelRatio = { get: () => 1, getPixelSizeForLayoutSize: (v) => v }

const Platform = { OS: 'ios' }

module.exports = {
  View,
  Text,
  ActivityIndicator,
  DrawerLayoutAndroid,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Switch,
  RefreshControl,
  SafeAreaView,
  TextInput,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
  PixelRatio,
  Platform
}
