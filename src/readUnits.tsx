import React from 'react'
import type { Style, Units } from './types'
import { useWindowDimensions, LayoutChangeEvent } from 'react-native'
import calculate from './cssToRN/calc'

const FontSizeContext = React.createContext(16)

function parseValue (value: string): [number, string | undefined] {
  const unitRegexp = /([+-]?\d+(\.\d+)?)([a-z%]+)?/i // Match a single unit
  const unit = value.match(unitRegexp)
  return [parseFloat(unit![1]), unit![3] as (string | undefined)]
}

function convertValue (key: string, value: string, units: Units) {
  const finalUnits = { ...units }
  console.log(key, value, units)
  if (value.includes('%')) {
    if (['marginTop', 'marginBottom', 'paddingTop', 'paddingBottom'].includes(key)) finalUnits['%'] = units.height
    else if (['marginLeft', 'marginRight', 'paddingLeft', 'paddingRight'].includes(key)) finalUnits['%'] = units.width
    else finalUnits['%'] = 0.01
  }
  const convertedValue = value.replace(/([+-]?\d+(\.\d+)?)([a-z%]+)?/ig, occ => {
    const [val, unit] = parseValue(occ)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (['deg', 'rad'].includes(unit!)) return occ // We don't want to convert deg and rad units
    return val * (units[unit as keyof Units || 'px']!) + ''
  })
  if (convertedValue.startsWith('calc(')) return calculate(convertedValue)
  else if (parseFloat(convertedValue) + '' === convertedValue) return parseFloat(convertedValue)
  else return convertedValue
}

/** Apply the new fontSize to the component before we can calculate em units */
export const withFontSizeUpdate = <T extends { rnStyle: Style }, >(Comp: React.ComponentType<T>) => (props: T) => {
  const rnStyle = props.rnStyle
  const [fontSize, fontUnit] = parseValue(rnStyle.fontSize)
  const isRelative = ['rem', 'em', '%'].includes(fontUnit || '')
  // If the font size is expressed with em units, we need to read the current font size value
  console.log('in', fontSize)
  if (isRelative) {
    return <FontSizeContext.Consumer>
      {fontSizeValue => {
        console.log('s', fontSizeValue)
        const newSize = fontUnit === 'em' ? fontSizeValue * fontSize
          : fontUnit === 'rem' ? fontSize * 16
            : fontUnit === '%' ? fontSizeValue * (1 + fontSize / 100)
              : fontSize
        rnStyle.fontSize = newSize + 'px'
        console.log('n', newSize)
        return <FontSizeContext.Provider value={newSize}>
          {
            <Comp {...props} rnStyle={rnStyle} />
          }
        </FontSizeContext.Provider>
      }}
    </FontSizeContext.Consumer>
  } else {
    rnStyle.fontSize = fontSize + 'px'
    console.log('f', fontSize)
    return <FontSizeContext.Provider value={fontSize}>
      {
        <Comp {...props} rnStyle={rnStyle} />
      }
    </FontSizeContext.Provider>
  }
}

export const withUnits = <T extends { rnStyle: Style }, >(Comp: React.ComponentType<T>, css: string) => (props: T) => {
  const useEM = css.match(/\dem\b/)// Do we need em units
  const useVX = css.match(/\dv([hw]|min|max)\b/)// Do we need vx units
  const usePct = css.match(/\d%\b/)// Do we need % units

  let FinalComponent = withRNStyle(Comp as React.ComponentType<T & { units: Units }>)
  if (useVX) {
    FinalComponent = withScreenSize(FinalComponent)
  }

  if (useEM) {
    FinalComponent = withFontSize(FinalComponent)
  }

  if (usePct) {
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
const withRNStyle = <T extends {units: Units; rnStyle: Style}, >(Component: React.ComponentType<T>) => (props: T) => {
  const { rnStyle, units, ...others } = props
  const finalStyle: any = {}
  Object.keys(rnStyle).forEach(key => {
    const value = rnStyle[key]
    // Handle object values
    if (key === 'transform') {

    } else if (key === 'shadowOffset') {

    } else {
      finalStyle[key] = convertValue(key, value, units)
    }
  })
  // We don't want to pollute the component's props
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  return <Component {...others} style={props.style ? [props.style, finalStyle] : finalStyle} />
}
