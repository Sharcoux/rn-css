/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react'
import * as RN from 'react-native'
import withStyle from './withStyle'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Styled<T, S = {}> = {
    (chunks: string[], ...functs: ((props: T) => string)[]): (props: T) => JSX.Element;
    attrs(opts: object | Function): (chunks: string[], ...functs: any[]) => (props: T) => JSX.Element;
} & {
  ActivityIndicator: Styled<RN.ActivityIndicatorProps>;
  Button: Styled<RN.ButtonProps>;
  DatePickerIOS: Styled<RN.DatePickerIOSProps>;
  DrawerLayoutAndroid: Styled<RN.DrawerLayoutAndroidProps>;
  Image: Styled<RN.ImageProps>;
  ImageBackground: Styled<RN.ImageBackgroundProps>;
  KeyboardAvoidingView: Styled<RN.KeyboardAvoidingViewProps>;
  ListView: Styled<RN.ListViewProps>;
  Modal: Styled<RN.ModalProps>;
  NavigatorIOS: Styled<RN.NavigatorIOSProps>;
  Picker: Styled<RN.PickerProps>;
  PickerIOS: Styled<RN.PickerIOSProps>;
  ProgressBarAndroid: Styled<RN.ProgressBarAndroidProps>;
  ProgressViewIOS: Styled<RN.ProgressViewIOSProps>;
  ScrollView: Styled<RN.ScrollViewProps>;
  SegmentedControlIOS: Styled<RN.SegmentedControlIOSProps>;
  Slider: Styled<RN.SliderProps>;
  SnapshotViewIOS: Styled<RN.SnapshotViewIOSProps>;
  Switch: Styled<RN.SwitchProps>;
  RecyclerViewBackedScrollView: Styled<RN.RecyclerViewBackedScrollViewProps>;
  RefreshControl: Styled<RN.RefreshControlProps>;
  SafeAreaView: Styled<RN.ViewProps>;
  StatusBar: Styled<RN.StatusBarProps>;
  SwipeableListView: Styled<RN.SwipeableListViewProps>;
  TabBarIOS: Styled<RN.TabBarIOSProps>;
  Text: Styled<RN.TextProps>;
  TextInput: Styled<RN.TextInputProps>;
  ToolbarAndroid: Styled<RN.ToolbarAndroidProps>;
  TouchableHighlight: Styled<RN.TouchableHighlightProps>;
  TouchableNativeFeedback: Styled<RN.TouchableNativeFeedbackProps>;
  TouchableOpacity: Styled<RN.TouchableOpacityProps>;
  TouchableWithoutFeedback: Styled<RN.TouchableWithoutFeedbackProps>;
  View: Styled<RN.ViewProps>;
  ViewPagerAndroid: Styled<RN.ViewPagerAndroidProps>;
  FlatList: Styled<RN.FlatListProps<S>>;
  SectionList: Styled<RN.SectionListProps<S>>;
  VirtualizedList: Styled<RN.VirtualizedListProps<S>>;
}

const styled = <T, >(Component: React.ComponentType<T>): Styled<T> => {
  const result = withStyle(Component) as Styled<T>
  result.ActivityIndicator = styled(RN.ActivityIndicator)
  result.Button = styled(RN.Button)
  result.DatePickerIOS = styled(RN.DatePickerIOS)
  result.DrawerLayoutAndroid = styled(RN.DrawerLayoutAndroid)
  result.Image = styled(RN.Image)
  result.ImageBackground = styled(RN.ImageBackground)
  result.KeyboardAvoidingView = styled(RN.KeyboardAvoidingView)
  result.ListView = styled(RN.ListView)
  result.Modal = styled(RN.Modal)
  result.NavigatorIOS = styled(RN.NavigatorIOS)
  result.Picker = styled(RN.Picker)
  result.PickerIOS = styled(RN.PickerIOS)
  result.ProgressBarAndroid = styled(RN.ProgressBarAndroid)
  result.ProgressViewIOS = styled(RN.ProgressViewIOS)
  result.ScrollView = styled(RN.ScrollView)
  result.SegmentedControlIOS = styled(RN.SegmentedControlIOS)
  result.Slider = styled(RN.Slider)
  result.SnapshotViewIOS = styled(RN.SnapshotViewIOS)
  result.Switch = styled(RN.Switch)
  result.RecyclerViewBackedScrollView = styled(RN.RecyclerViewBackedScrollView)
  result.RefreshControl = styled(RN.RefreshControl)
  result.SafeAreaView = styled(RN.SafeAreaView)
  result.StatusBar = styled(RN.StatusBar)
  result.SwipeableListView = styled(RN.SwipeableListView)
  result.TabBarIOS = styled(RN.TabBarIOS)
  result.Text = styled(RN.Text)
  result.TextInput = styled(RN.TextInput)
  result.ToolbarAndroid = styled(RN.ToolbarAndroid)
  result.TouchableHighlight = styled(RN.TouchableHighlight)
  result.TouchableNativeFeedback = styled(RN.TouchableNativeFeedback)
  result.TouchableOpacity = styled(RN.TouchableOpacity)
  result.TouchableWithoutFeedback = styled(RN.TouchableWithoutFeedback)
  result.View = styled(RN.View)
  result.ViewPagerAndroid = styled(RN.ViewPagerAndroid)
  // @ts-ignore
  result.FlatList = styled(RN.FlatList)
  // @ts-ignore
  result.SectionList = styled(RN.SectionList)
  // @ts-ignore
  result.VirtualizedList = styled(RN.VirtualizedList)
  return result
}

export default styled
