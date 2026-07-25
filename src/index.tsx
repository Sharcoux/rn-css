import * as RN from 'react-native'
import './polyfill'
import styledComponent, { styledFlatList, styledSectionList, styledVirtualizedList } from './styleComponent'
export { cssToRNStyle } from './cssToRN'
export { SharedValue, FontSizeContext, RemContext, DefaultTheme } from './styleComponent'
export * from './useTheme'

const styledMembers = {
  ActivityIndicator: styledComponent(RN.ActivityIndicator),
  DrawerLayoutAndroid: styledComponent(RN.DrawerLayoutAndroid),
  Image: styledComponent(RN.Image),
  ImageBackground: styledComponent(RN.ImageBackground),
  KeyboardAvoidingView: styledComponent(RN.KeyboardAvoidingView),
  Modal: styledComponent(RN.Modal),
  NavigatorIOS: styledComponent(RN.NavigatorIOS),
  ScrollView: styledComponent(RN.ScrollView),
  SnapshotViewIOS: styledComponent(RN.SnapshotViewIOS),
  Switch: styledComponent(RN.Switch),
  RecyclerViewBackedScrollView: styledComponent(RN.RecyclerViewBackedScrollView),
  RefreshControl: styledComponent(RN.RefreshControl),
  SafeAreaView: styledComponent(RN.SafeAreaView),
  Text: styledComponent(RN.Text),
  TextInput: styledComponent(RN.TextInput),
  TouchableHighlight: styledComponent(RN.TouchableHighlight),
  TouchableNativeFeedback: styledComponent(RN.TouchableNativeFeedback),
  TouchableOpacity: styledComponent(RN.TouchableOpacity),
  TouchableWithoutFeedback: styledComponent(RN.TouchableWithoutFeedback),
  View: styledComponent(RN.View),
  FlatList: styledFlatList,
  SectionList: styledSectionList,
  VirtualizedList: styledVirtualizedList
}

Object.assign(styledComponent, styledMembers)

/**
 * Annotate with `typeof import(...)` so index.d.ts keeps a reference to styleComponent
 * instead of inlining Omit/Pick (which collapses soft-union attrs props).
 */
const styled: typeof import('./styleComponent').default & typeof styledMembers = styledComponent as typeof styledComponent & typeof styledMembers
export default styled
