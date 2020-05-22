import React from 'react'
import * as RN from 'react-native'
import withStyle from './withStyle'

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const styled = (Component: React.ComponentType<any>) => {
  return withStyle(Component)
}

/* Define a getter for each alias which simply gets the reactNative component
 * and passes it to styled */
(['ActivityIndicator', 'Button', 'DatePickerIOS', 'DrawerLayoutAndroid', 'Image',
  'ImageBackground', 'KeyboardAvoidingView', 'ListView', 'Modal', 'NavigatorIOS', 'Picker',
  'PickerIOS', 'ProgressBarAndroid', 'ProgressViewIOS', 'ScrollView', 'SegmentedControlIOS', 'Slider', 'SnapshotViewIOS',
  'Switch', 'RecyclerViewBackedScrollView', 'RefreshControl', 'SafeAreaView', 'StatusBar', 'SwipeableListView', 'TabBarIOS',
  'Text', 'TextInput', 'ToolbarAndroid', 'TouchableHighlight',
  'TouchableNativeFeedback', 'TouchableOpacity', 'TouchableWithoutFeedback', 'View', 'ViewPagerAndroid', 'FlatList',
  'SectionList', 'VirtualizedList'] as const).forEach(alias =>
  Object.defineProperty(styled, alias, {
    enumerable: true,
    configurable: false,
    get () {
      return styled(RN[alias])
    }
  })
)

export default styled
