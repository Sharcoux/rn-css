/* eslint-disable react/display-name */
import React from 'react'
import type { Units } from './types'
import { useWindowDimensions, LayoutChangeEvent } from 'react-native'
import { parseValue } from './convertUnits'

const FontSizeContext = React.createContext(16)

/** HOC that will apply the screen size to the styles defined with vmin, vmax, vw, vh units, and handle media queries constraints */
export const withScreenSize = <Props extends {units: Units}>(Comp: React.ComponentType<Props>) => React.forwardRef<typeof Comp, Props>((props: Props, ref) => {
  const { width, height } = useWindowDimensions()
  const Result = Comp as React.ComponentType<Props>
  return <Result {...props} ref={ref} units={{ ...props.units, vw: width / 100, vh: height / 100, vmin: Math.min(width, height) / 100, vmax: Math.max(width, height) / 100 }}/>
})

/** HOC that will apply the style reserved for hover state if needed */
export const withHover = <Props extends { rnStyle: any }>(Comp: React.ComponentType<Props>) => React.forwardRef<typeof Comp, Props>((props: Props, ref) => {
  const { rnStyle } = props
  const [hover, setHover] = React.useState(false)
  const style = (hover && rnStyle.hover) ? { ...rnStyle, ...rnStyle.hover } : { ...rnStyle }
  delete style.hover
  const Result = Comp as React.ComponentType<Props>
  return <Result {...props} ref={ref} rnStyle={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} />
})

/** HOC that will apply the font size to the styles defined with em units */
export const withFontSize = <Props extends {units: Units}>(Comp: React.ComponentType<Props>) => React.forwardRef<typeof Comp, Props>((props: Props, ref) => {
  return (
    <FontSizeContext.Consumer>
      {em => {
        const Result = Comp as React.ComponentType<Props>
        return <Result {...props} ref={ref} units={{ ...props.units, em }} />
      }}
    </FontSizeContext.Consumer>
  )
})

/** HOC that will apply the font size to the styles defined with em units */
export const withLayout = <Props extends {units: Units; onLayout?: (event: LayoutChangeEvent) => void}>(Comp: React.ComponentType<Props>) => React.forwardRef<typeof Comp, Props>((props: Props, ref) => {
  const [layout, setLayout] = React.useState({ width: 0, height: 0 })
  const updateLayout = React.useCallback((event: LayoutChangeEvent) => {
    if (props.onLayout) props.onLayout(event)
    const { width, height } = event.nativeEvent.layout
    if (width !== layout.width || height !== layout.height) setLayout({ width, height })
  }, [props.onLayout])
  const Result = Comp as React.ComponentType<Props>
  return <Result {...props} ref={ref} onLayout={updateLayout} units={{ ...props.units, ...layout }} />
})

/** Apply the new fontSize to the component before we can calculate em units */
export const withFontSizeUpdate = <Props extends { rnStyle: any }, >(Comp: React.ComponentType<Props>) => React.forwardRef<typeof Comp, Props>((props: Props, ref) => {
  const rnStyle = props.rnStyle
  const [fontSize, fontUnit] = parseValue(rnStyle.fontSize)
  const isRelative = ['rem', 'em', '%'].includes(fontUnit || '')
  // If the font size is expressed with em units, we need to read the current font size value
  const Result = Comp as React.ComponentType<Props>
  if (isRelative) {
    return <FontSizeContext.Consumer>
      {fontSizeValue => {
        const newSize = fontUnit === 'em' ? fontSizeValue * fontSize
          : fontUnit === 'rem' ? fontSize * 16
            : fontUnit === '%' ? fontSizeValue * (1 + fontSize / 100)
              : fontSize
        return <FontSizeContext.Provider value={newSize}>
          <Result {...props} ref={ref} rnStyle={{ ...rnStyle, fontSize: newSize + 'px' }} />
        </FontSizeContext.Provider>
      }}
    </FontSizeContext.Consumer>
  } else {
    rnStyle.fontSize = fontSize + 'px'
    return <FontSizeContext.Provider value={fontSize}>
      <Result {...props} ref={ref} rnStyle={{ ...rnStyle }} />
    </FontSizeContext.Provider>
  }
})
