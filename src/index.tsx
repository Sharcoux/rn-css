import React from 'react'
import * as RN from 'react-native'
import './polyfill'
import styledComponent, { styledFlatList, styledSectionList, styledVirtualizedList } from './styleComponent'
export { cssToRNStyle } from './cssToRN'
export { SharedValue, FontSizeContext, RemContext, DefaultTheme } from './styleComponent'
export * from './useTheme'

const styled = <StyleType, InitialProps extends { style?: RN.StyleProp<StyleType> }>(Component: React.ComponentType<InitialProps>) => styledComponent<StyleType, InitialProps>(Component)

styled.ActivityIndicator = styled(RN.ActivityIndicator)
styled.DrawerLayoutAndroid = styled(RN.DrawerLayoutAndroid)
styled.Image = styled(RN.Image)
styled.ImageBackground = styled(RN.ImageBackground)
styled.KeyboardAvoidingView = styled(RN.KeyboardAvoidingView)
styled.Modal = styled(RN.Modal)
styled.NavigatorIOS = styled(RN.NavigatorIOS)
styled.ScrollView = styled(RN.ScrollView)
styled.SnapshotViewIOS = styled(RN.SnapshotViewIOS)
styled.Switch = styled(RN.Switch)
styled.RecyclerViewBackedScrollView = styled(RN.RecyclerViewBackedScrollView)
styled.RefreshControl = styled(RN.RefreshControl)
styled.SafeAreaView = styled(RN.SafeAreaView)
styled.Text = styled(RN.Text)
styled.TextInput = styled(RN.TextInput)
styled.TouchableHighlight = styled(RN.TouchableHighlight)
styled.TouchableNativeFeedback = styled(RN.TouchableNativeFeedback)
styled.TouchableOpacity = styled(RN.TouchableOpacity)
styled.TouchableWithoutFeedback = styled(RN.TouchableWithoutFeedback)
styled.View = styled(RN.View)
styled.FlatList = styledFlatList
styled.SectionList = styledSectionList
styled.VirtualizedList = styledVirtualizedList

export default styled
