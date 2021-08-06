/* eslint-disable react/display-name */
import { /* StyleSheet, */ TextStyle, ViewStyle } from 'react-native'
import { convertValue } from './convertUnits'
import type { PartialStyle, Units } from './types'

/** Mix the calculated RN style within the object style */
const convertStyle = (rnStyle: PartialStyle, units: Units) => {
  /** This is the result of the convertions from css style into RN style */
  const convertedStyle: TextStyle & ViewStyle = {};
  // If width and height are specified, we can use those values for the first render
  (['width', 'height'] as const).forEach(key => {
    if (!units[key] && rnStyle[key]) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const converted = convertValue(key, rnStyle[key]!, units)
      if (!Number.isNaN(converted)) units[key] = converted as number
    }
  })
  ;(Object.keys(rnStyle) as (keyof PartialStyle)[]).forEach(key => {
    const value = rnStyle[key] || '0'
    // Handle object values
    if (key === 'transform' && rnStyle.transform) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      convertedStyle.transform = rnStyle.transform!.map(transformation => {
        const result = {} as { [trans: string]: string | number }
        (Object.keys(transformation) as Array<keyof typeof transformation>).forEach(k => (result[k] = convertValue(k, transformation[k]!, units)))
        return result
      }) as unknown as TextStyle['transform']
    }
    else if (key === 'shadowOffset' && rnStyle.shadowOffset) {
      convertedStyle.shadowOffset = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        width: convertValue(key, rnStyle.shadowOffset!.width || '0', units) as number,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        height: convertValue(key, rnStyle.shadowOffset!.height || '0', units) as number
      }
    }
    else if (key === 'textShadowOffset' && rnStyle.textShadowOffset) {
      convertedStyle.textShadowOffset = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        width: convertValue(key, rnStyle.textShadowOffset!.width || '0', units) as number,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        height: convertValue(key, rnStyle.textShadowOffset!.height || '0', units) as number
      }
    }
    // Font family should not be transformed
    else if (key === 'fontFamily') {
      convertedStyle[key] = value
    }
    else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      convertedStyle[key] = convertValue(key, value, units)
    }
  })
  return convertedStyle
}

export default convertStyle
