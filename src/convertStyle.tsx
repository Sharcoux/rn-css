/* eslint-disable react/display-name */
import type { Style, Units } from './types'
import { /* StyleSheet, */ StyleProp, TextStyle } from 'react-native'
import { convertValue } from './convertUnits'

/** Mix the calculated RN style within the object style */
const convertStyle = <T, >(propsStyle: StyleProp<T> | undefined, rnStyle: Style, units: Units): StyleProp<T> => {
  /** This is the result of the convertions from css style into RN style */
  const convertedStyle: TextStyle = {}
  Object.keys(rnStyle).forEach(key => {
    const value = rnStyle[key]
    // Handle object values
    if (key === 'transform') {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      convertedStyle.transform = rnStyle.transform!.map(transformation => {
        const result = {} as { [trans: string]: string | number }
        (Object.keys(transformation) as Array<keyof typeof transformation>).forEach(k => (result[k] = convertValue(k, transformation[k]!, units)))
        return result
      }) as unknown as TextStyle['transform']
    } else if (key === 'shadowOffset') {
      convertedStyle.shadowOffset = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        width: convertValue(key, rnStyle.shadowOffset!.width || '0', units) as number,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        height: convertValue(key, rnStyle.shadowOffset!.height || '0', units) as number
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      convertedStyle[key] = convertValue(key, value, units)
    }
  })
  return (propsStyle ? [propsStyle, convertedStyle] : convertedStyle) as StyleProp<T>
}

export default convertStyle
