/* eslint-disable @typescript-eslint/ban-ts-ignore */
import React from 'react'
import * as RN from 'react-native'
import withStyle from './withStyle'

const styled = <T, >(Component: React.ComponentType<T>) => withStyle<T>(Component)

styled.ActivityIndicator = styled(RN.ActivityIndicator)
styled.Button = styled(RN.Button)
styled.DrawerLayoutAndroid = styled(RN.DrawerLayoutAndroid)
styled.Image = styled(RN.Image)
styled.ImageBackground = styled(RN.ImageBackground)
styled.KeyboardAvoidingView = styled(RN.KeyboardAvoidingView)
styled.ListView = styled(RN.ListView)
styled.Modal = styled(RN.Modal)
styled.NavigatorIOS = styled(RN.NavigatorIOS)
styled.ScrollView = styled(RN.ScrollView)
styled.SnapshotViewIOS = styled(RN.SnapshotViewIOS)
styled.Switch = styled(RN.Switch)
styled.RecyclerViewBackedScrollView = styled(RN.RecyclerViewBackedScrollView)
styled.RefreshControl = styled(RN.RefreshControl)
styled.SafeAreaView = styled(RN.SafeAreaView)
styled.StatusBar = styled(RN.StatusBar)
styled.SwipeableListView = styled(RN.SwipeableListView)
styled.TabBarIOS = styled(RN.TabBarIOS)
styled.Text = styled(RN.Text)
styled.TextInput = styled(RN.TextInput)
styled.ToolbarAndroid = styled(RN.ToolbarAndroid)
styled.TouchableHighlight = styled(RN.TouchableHighlight)
styled.TouchableNativeFeedback = styled(RN.TouchableNativeFeedback)
styled.TouchableOpacity = styled(RN.TouchableOpacity)
styled.TouchableWithoutFeedback = styled(RN.TouchableWithoutFeedback)
styled.View = styled(RN.View)
styled.ViewPagerAndroid = styled(RN.ViewPagerAndroid)
styled.FlatList = styled(RN.FlatList)
styled.SectionList = styled(RN.SectionList)
styled.VirtualizedList = styled(RN.VirtualizedList)

export default styled
