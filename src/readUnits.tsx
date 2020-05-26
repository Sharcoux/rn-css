/* eslint-disable react/display-name */
import React, { forwardRef } from 'react'
import type { Style, Units } from './types'
import { StyleSheet, TextStyle } from 'react-native'
import { convertValue } from './convertUnits'
import { withLayout, withScreenSize, withFontSize, withHover } from './features'

// eslint-disable-next-line
const ZIndexContext = React.createContext<(z: number) => void>(() => {})

export const withUnits = <Props, >(Comp: React.ComponentType<Props>, css: string) => {
  const FinalComponent = React.useMemo(() => {
    const useFontSize = css.match(/\b(\d+)(\.\d+)?em\b/) // Do we need em units
    const useScreenSize = css.match(/\b(\d+)(\.\d+)?v([hw]|min|max)\b/) // Do we need vx units
    const useLayout = css.match(/\d%/) // Do we need % units
    const useHover = css.match(/&:hover/) // Do we need to track the mouse

    let FinalComponent = Comp as React.ForwardRefExoticComponent<Props>
    FinalComponent = withRNStyle<Props & { units: Units; }>(FinalComponent as React.ComponentType<Props & { units: Units }>) as React.ForwardRefExoticComponent<Props>
    if (useScreenSize) {
      FinalComponent = withScreenSize(FinalComponent as React.ComponentType<Props & { units: Units }>) as React.ForwardRefExoticComponent<Props>
    }

    if (useFontSize) {
      FinalComponent = withFontSize(FinalComponent as React.ComponentType<Props & { units: Units }>) as React.ForwardRefExoticComponent<Props>
    }

    if (useLayout) {
      FinalComponent = withLayout(FinalComponent as React.ComponentType<Props & { units: Units }>) as React.ForwardRefExoticComponent<Props>
    }

    if (useHover) {
      FinalComponent = withHover(FinalComponent as React.ComponentType<Props & { rnStyle: Style }>) as React.ForwardRefExoticComponent<Props>
    }

    return FinalComponent
  }, [css, Comp])

  return forwardRef<typeof Comp, Props>((props: Props, ref) => <FinalComponent ref={ref} units={{ rem: 16, px: 1, pt: 72 / 96, in: 96, pc: 9, em: 16 }} {...props} />)
}

/** Mix the calculated RN style within the object style */
const withRNStyle = <Props extends {units: Units; }, >(Comp: React.ComponentType<Props>) => React.forwardRef<typeof Comp, Props>((props: Props, ref) => {
  const [zIndex, setZIndex] = React.useState<number>()
  const { rnStyle, units, style, ...others } = props as Props & { rnStyle: Style; style?: TextStyle }
  const finalStyle: any = {}
  Object.keys(rnStyle).forEach(key => {
    const value = rnStyle[key]
    // Handle object values
    if (key === 'transform') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      finalStyle.transform = rnStyle.transform!.map(transformation => {
        const result = {} as { [trans: string]: string | number }
        (Object.keys(transformation) as Array<keyof typeof transformation>).forEach(k => (result[k] = convertValue(k, transformation[k]!, units)))
        return result
      })
    } else if (key === 'shadowOffset') {
      finalStyle.shadowOffset = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        width: convertValue(key, rnStyle.shadowOffset!.width, units),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        height: convertValue(key, rnStyle.shadowOffset!.height, units)
      }
    } else {
      finalStyle[key] = convertValue(key, value, units)
    }
  })

  // Here, we fix a difference between web and native for zIndex.
  let styleWithZIndex = [finalStyle]
  if (style) styleWithZIndex.push(style)
  if (zIndex) styleWithZIndex.push({ zIndex })
  if (styleWithZIndex.length === 1) styleWithZIndex = styleWithZIndex[0]
  const newZIndex = StyleSheet.flatten(styleWithZIndex).zIndex
  if (newZIndex !== zIndex) setZIndex(newZIndex)
  const updateParentZIndex = React.useContext(ZIndexContext)
  React.useEffect(() => {
    if (zIndex) updateParentZIndex(zIndex)
  }, [zIndex, updateParentZIndex])

  // We don't want to pollute the component's props
  const Result = Comp as React.ComponentType<Pick<Props, Exclude<keyof Props, 'rnStyle' | 'style' | 'units'>>>
  return <ZIndexContext.Provider value={setZIndex}>
    <Result {...others} ref={ref} style={styleWithZIndex} />
  </ZIndexContext.Provider>
})
