/* eslint-disable react/display-name */
import React, { MouseEvent } from 'react'
import type { Style } from './types'
import { useWindowDimensions, LayoutChangeEvent, Platform } from 'react-native'
import { parseValue } from './convertUnits'

export const FontSizeContext = React.createContext(16)
// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
export const zIndexContext = React.createContext((_zIndex: number) => {})

/** HOC that will apply the screen size to the styles defined with vmin, vmax, vw, vh units, and handle media queries constraints */
export const useScreenSize = () => {
  const { width, height } = useWindowDimensions()
  return { vw: width / 100, vh: height / 100, vmin: Math.min(width, height) / 100, vmax: Math.max(width, height) / 100 }
}

/** HOC that will apply the style reserved for hover state if needed */
export const useHover = (rnStyle: Style, onMouseEnter?: (event: MouseEvent) => void, onMouseLeave?: (event: MouseEvent) => void) => {
  const [hover, setHover] = React.useState(false)
  const style: Style = React.useMemo(() => {
    const style = (hover && rnStyle.hover) ? { ...rnStyle, ...rnStyle.hover } : { ...rnStyle }
    delete style.hover
    return style
  }, [rnStyle, hover])
  const hoverStart = React.useCallback((event: MouseEvent) => {
    if (onMouseEnter) onMouseEnter(event)
    setHover(true)
  }, [onMouseEnter])
  const hoverStop = React.useCallback((event: MouseEvent) => {
    if (onMouseLeave) onMouseLeave(event)
    setHover(false)
  }, [onMouseLeave])
  return { style, onMouseEnter: rnStyle.hover ? hoverStart : onMouseEnter, onMouseLeave: rnStyle.hover ? hoverStop : onMouseLeave }
}

/** HOC that will apply the font size to the styles defined with em units */
export const useLayout = (onLayout?: (event: LayoutChangeEvent) => void) => {
  const [layout, setLayout] = React.useState({ width: 0, height: 0 })
  const updateLayout = React.useCallback((event: LayoutChangeEvent) => {
    if (onLayout) onLayout(event)
    const { width, height } = event.nativeEvent.layout
    if (width !== layout.width || height !== layout.height) setLayout({ width, height })
  }, [onLayout, layout.width, layout.height])
  return { onLayout: updateLayout, ...layout }
}

/** Apply the new fontSize to the component before we can calculate em units */
export const useFontSize = (setFontSize?: string, rem = 16): { em: number } => {
  const em = React.useContext(FontSizeContext)
  if (!setFontSize) return { em }
  const [fontSize, fontUnit] = parseValue(setFontSize)
  const isRelative = ['rem', 'em', '%'].includes(fontUnit || '')
  if (isRelative) {
    const newSize = fontUnit === 'em' ? em * fontSize
      : fontUnit === 'rem' ? fontSize * rem
        : fontUnit === '%' ? em * (1 + fontSize / 100)
          : fontSize
    return { em: newSize }
  }
  else {
    return { em: fontSize }
  }
}

export const useZIndex = (zIndexFromStyle: number) => {
  const [zIndex, setZIndex] = React.useState<number>()
  const updateParentZIndex = React.useContext(zIndexContext)
  React.useEffect(() => {
    setZIndex(zIndexFromStyle)
    if (Platform.OS === 'ios' && zIndexFromStyle && zIndexFromStyle !== zIndex) updateParentZIndex(zIndexFromStyle)
  }, [zIndexFromStyle, updateParentZIndex])
  return Platform.OS === 'web' ? (zIndex || 'auto') : zIndex
}
