import React from 'react'
import type { Style, Units } from './types'
import { useWindowDimensions, LayoutChangeEvent, StyleSheet, TextStyle } from 'react-native'
import { parseValue, convertValue } from './convertUnits'

const FontSizeContext = React.createContext(16)
// eslint-disable-next-line
const ZIndexContext = React.createContext<(z: number) => void>(() => {})

/** Apply the new fontSize to the component before we can calculate em units */
export const withFontSizeUpdate = <T extends { rnStyle: Style }, >(Comp: React.ComponentType<T>) => (props: T) => {
  const rnStyle = props.rnStyle
  const [fontSize, fontUnit] = parseValue(rnStyle.fontSize)
  const isRelative = ['rem', 'em', '%'].includes(fontUnit || '')
  // If the font size is expressed with em units, we need to read the current font size value
  if (isRelative) {
    return <FontSizeContext.Consumer>
      {fontSizeValue => {
        const newSize = fontUnit === 'em' ? fontSizeValue * fontSize
          : fontUnit === 'rem' ? fontSize * 16
            : fontUnit === '%' ? fontSizeValue * (1 + fontSize / 100)
              : fontSize
        return <FontSizeContext.Provider value={newSize}>
          {
            <Comp {...props} rnStyle={{ ...rnStyle, fontSize: newSize + 'px' }} />
          }
        </FontSizeContext.Provider>
      }}
    </FontSizeContext.Consumer>
  } else {
    rnStyle.fontSize = fontSize + 'px'
    return <FontSizeContext.Provider value={fontSize}>
      {
        <Comp {...props} rnStyle={rnStyle} />
      }
    </FontSizeContext.Provider>
  }
}

export const withUnits = <T extends { rnStyle: Style }, >(Comp: React.ComponentType<T>, css: string) => (props: T) => {
  const useFontSize = css.match(/\b(\d+)(\.\d+)?em\b/) // Do we need em units
  const useScreenSize = css.match(/\b(\d+)(\.\d+)v([hw]|min|max)\b/) // Do we need vx units
  const useLayout = css.match(/\d%/) // Do we need % units

  let FinalComponent = withRNStyle(Comp as React.ComponentType<T & { units: Units; children?: React.ReactNode }>)
  if (useScreenSize) {
    FinalComponent = withScreenSize(FinalComponent)
  }

  if (useFontSize) {
    FinalComponent = withFontSize(FinalComponent)
  }

  if (useLayout) {
    FinalComponent = withLayout(FinalComponent)
  }

  return <FinalComponent units={{ rem: 16, px: 1, pt: 72 / 96, in: 96, pc: 9, em: 16 }} {...props} />
}

/** HOC that will apply the screen size to the styles defined with vmin, vmax, vw, vh units */
const withScreenSize = <T extends {units: Units; rnStyle: Style}>(Comp: React.ComponentType<T>) => (props: T) => {
  const { width, height } = useWindowDimensions()
  return <Comp {...props} units={{ ...props.units, vw: width / 100, vh: height / 100, vmin: Math.min(width, height) / 100, vmax: Math.max(width, height) / 100 }}/>
}

/** HOC that will apply the font size to the styles defined with em units */
const withFontSize = <T extends {units: Units; rnStyle: Style}>(Comp: React.ComponentType<T>) => (props: T) => {
  return (
    <FontSizeContext.Consumer>
      {em => {
        return <Comp {...props} units={{ ...props.units, em }} />
      }}
    </FontSizeContext.Consumer>
  )
}

/** HOC that will apply the font size to the styles defined with em units */
const withLayout = <T extends {units: Units; onLayout?: (event: LayoutChangeEvent) => void}>(Comp: React.ComponentType<T>) => (props: T) => {
  const [layout, setLayout] = React.useState({ width: 0, height: 0 })
  const updateLayout = React.useCallback((event: LayoutChangeEvent) => {
    if (props.onLayout) props.onLayout(event)
    const { width, height } = event.nativeEvent.layout
    setLayout({ width, height })
  }, [props.onLayout])
  return <Comp {...props} onLayout={updateLayout} units={{ ...props.units, ...layout }} />
}

/** Mix the calculated RN style within the object style */
const withRNStyle = <T extends {units: Units; rnStyle: Style; style?: TextStyle; children?: React.ReactNode}>(Component: React.ComponentType<T>) => (props: T) => {
  const [zIndex, setZIndex] = React.useState(-1)
  const { rnStyle, units, ...others } = props
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
  let style = [finalStyle]
  if (props.style) style.push(props.style)
  if (zIndex >= 0) style.push({ zIndex })
  if (style.length === 1) style = style[0]
  const updateParentZIndex = React.useContext(ZIndexContext)
  React.useEffect(() => {
    const finalZIndex = StyleSheet.flatten(style).zIndex
    if (finalZIndex) updateParentZIndex(finalZIndex)
  }, [zIndex, updateParentZIndex])

  return <ZIndexContext.Provider value={setZIndex}>
    {/* We don't want to pollute the component's props */}
    <Component {...others as T} style={style} />
  </ZIndexContext.Provider>
}
