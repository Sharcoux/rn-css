/* eslint-disable react/display-name */
import React, { MouseEvent } from 'react'
import type { Style, Units, MediaQuery, PartialStyle } from './types'
import { useWindowDimensions, LayoutChangeEvent } from 'react-native'
import { parseValue } from './convertUnits'
import { createContext } from './cssToRN/mediaQueries'

/** Hook that will apply the screen size to the styles defined with vmin, vmax, vw, vh units, and handle media queries constraints */
export const useScreenSize = () => {
  const { width, height } = useWindowDimensions()
  return React.useMemo(() => ({
    vw: width / 100, vh: height / 100, vmin: Math.min(width, height) / 100, vmax: Math.max(width, height) / 100
  }), [height, width])
}

/** Hook that will apply the style reserved for hover state if needed */
export const useHover = (onMouseOver: undefined | ((event: MouseEvent) => void), onMouseLeave: undefined | ((event: MouseEvent) => void | undefined), needsHover: boolean) => {
  const [hover, setHover] = React.useState(false)
  const hoverStart = React.useMemo(() => needsHover ? (event: MouseEvent) => {
    if (onMouseOver) onMouseOver(event)
    setHover(true)
  } : undefined, [needsHover, onMouseOver])
  const hoverStop = React.useMemo(() => needsHover ? (event: MouseEvent) => {
    if (onMouseLeave) onMouseLeave(event)
    setHover(false)
  } : undefined, [needsHover, onMouseLeave])
  return { hover, onMouseOver: hoverStart || onMouseOver, onMouseLeave: hoverStop || onMouseLeave }
}

/** Hook that will apply the style provided in the media queries */
export const useMediaQuery = (media: undefined | MediaQuery[], units: Units): Style | undefined => {
  const mediaStyle = React.useMemo(() => {
    if (media) {
      const context = createContext(units)
      const mediaStyles = media.map(m => m(context)).filter(m => !!m) as PartialStyle[]
      if (!mediaStyles.length) return
      const mq = {} as Style
      Object.assign(mq, ...mediaStyles)
      return mq
    }
  }, [media, units])
  return mediaStyle
}

/** Hook that will measure the layout to handle styles that use % units */
export const useLayout = (onLayout: undefined | ((event: LayoutChangeEvent) => void), needsLayout: boolean) => {
  const [layout, setLayout] = React.useState({ width: 0, height: 0 })
  // Prevent calling setState if the component is unmounted
  const unmounted = React.useRef(false)
  React.useEffect(() => () => { unmounted.current = true }, [])
  const updateLayout = React.useMemo(() => needsLayout ? (event: LayoutChangeEvent) => {
    if (unmounted.current) return
    if (onLayout) onLayout(event)
    const { width, height } = event.nativeEvent.layout
    setLayout(layout => layout.width === width && layout.height === height ? layout : { width, height })
  } : undefined, [needsLayout, onLayout])
  return { onLayout: updateLayout || onLayout, ...layout }
}

/** Apply the new fontSize to the component before we can calculate em units */
export const useFontSize = (fontSizeTarget: string | undefined, rem: number, em: number): { em: number } => {
  const [fontSize, fontUnit] = React.useMemo(() => fontSizeTarget === undefined ? [] : parseValue(fontSizeTarget), [fontSizeTarget])
  const isRelative = fontUnit && ['rem', 'em', '%'].includes(fontUnit)
  const newSize = React.useMemo(() => {
    if (fontSize && isRelative) {
      const newSize = fontUnit === 'em' ? em * fontSize
        : fontUnit === 'rem' ? fontSize * rem
          : fontUnit === '%' ? em * (1 + fontSize / 100)
            : fontSize
      return newSize
    }
    else return fontSize || em
  }, [em, fontSize, fontUnit, isRelative, rem])
  return { em: newSize }
}
