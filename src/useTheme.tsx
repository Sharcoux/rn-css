import React from 'react'
import { SharedValue } from './styleComponent'

export const ThemeProvider = ({ theme, children }: { theme: unknown; children: React.ReactNode }) => {
  return <SharedValue.Provider value={theme}>
    {children}
  </SharedValue.Provider>
}

export const useTheme = () => React.useContext(SharedValue)

export const withTheme = <T, >(Component: React.ComponentType<T>) => {
  const theme = useTheme()
  const ThemedComponent = React.forwardRef<React.Component, T>((props: T, ref) => <Component ref={ref} theme={theme} {...props} />)
  ThemedComponent.displayName = 'ThemedComponent'
  return ThemedComponent
}
