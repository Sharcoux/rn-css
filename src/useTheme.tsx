import React from 'react'
import { DefaultTheme, SharedValue } from './styleComponent'

/** Provider for the theme. */
export const ThemeProvider = ({ theme, children }: { theme: DefaultTheme; children: React.ReactNode }) => {
  return <SharedValue.Provider value={theme}>
    {children}
  </SharedValue.Provider>
}

/**
 * Returns the Theme
 * @returns The Theme object
 */
export const useTheme = () => React.useContext(SharedValue)

/**
 * Adds the theme prop to a non rn-css component
 * @param Component A non rn-css component
 * @returns A component with the theme prop
 */
export const withTheme = <T, >(Component: React.ComponentType<T>) => {
  const ThemedComponent = React.forwardRef<React.Component, T>((props: T, ref) => {
    const theme = useTheme()
    return <Component ref={ref} theme={theme} {...props} />
  })
  ThemedComponent.displayName = 'ThemedComponent'
  return ThemedComponent
}
