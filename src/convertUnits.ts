import type { PartialStyle, Transform, Units } from './types'
import { calculate, min, max } from './cssToRN/maths'
import { Platform } from './react-native'

/** Take a css value like 12em and return [12, 'em'] */
export function parseValue (value: string): [number, string | undefined] {
  // Match a single unit
  const unit = value.match(/([+-]?\b\d+(\.\d+)?)([a-z]+\b|%)?/i)
  return unit ? [parseFloat(unit[1]), unit[3] as (string | undefined)] : [0, undefined]
}

/** Convert a value using the provided unit transform table */
export function convertValue (key: keyof PartialStyle | keyof Transform, value: string, units: Units): string | number {
  if (typeof value !== 'string') {
    console.error(`Failed to parse CSS instruction: ${key}=${value}. We expect a string, but ${value} was of type ${typeof value}.`)
    return 0
  }
  // colors should be left untouched
  if (value.startsWith('#')) return value

  // Percentage values need to rely on an other unit as reference
  const finalUnits = { ...units }
  if (value.includes('%')) {
    // Percentage is not supported on borders in web
    if (Platform.OS === 'web' && (!key.toLowerCase().includes('border') || key.toLowerCase().includes('radius'))) return value
    if (['marginTop', 'marginBottom', 'translateY'].includes(key) || key.startsWith('borderTop') || key.startsWith('borderBottom')) finalUnits['%'] = units.height! / 100
    else if (['marginLeft', 'marginRight', 'translateX'].includes(key) || key.startsWith('borderLeft') || key.startsWith('borderRight')) finalUnits['%'] = units.width! / 100
    else if (key.startsWith('border') && key.endsWith('Radius')) finalUnits['%'] = ((units.width || 0) + (units.height || 0)) / 200
    else if (['width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'top', 'left', 'bottom', 'right', 'flexBasis', 'rotate3d'].includes(key)) {
      if (value.startsWith('calc') || value.startsWith('max') || value.startsWith('min')) {
        if (['height', 'minHeight', 'maxHeight', 'top', 'bottom'].includes(key)) finalUnits['%'] = (units.height || 0) / 100
        else finalUnits['%'] = (units.width || 0) / 100
      }
      // width: 100%, height: 100% are supported
      else return value
    }
    else if (['lineHeight'].includes(key)) finalUnits['%'] = units.em / 100
    else finalUnits['%'] = 0.01
  }

  // We replace all units within the value
  const convertedValue = value.replace(/(\b\d+(\.\d+)?)([a-z]+\b|%)/ig, occ => {
    const [val, unit] = parseValue(occ)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (['deg', 'rad', 'turn', 's'].includes(unit!)) return occ // We don't want to convert deg, rad, turn, second units
    return val * (finalUnits[unit as keyof Units || 'px'] || 1) + ''
  })

  // We handle extra calculations (calc, min, max, parsing...)
  if (convertedValue.startsWith('calc(')) return calculate(convertedValue.substring(4))// remove calc. We can keep the parenthesis
  else if (convertedValue.startsWith('max(')) return max(convertedValue.substring(4, convertedValue.length - 1))// Remove max()
  else if (convertedValue.startsWith('min(')) return min(convertedValue.substring(4, convertedValue.length - 1))// remove min()
  else if (key === 'fontWeight') return convertedValue // fontWeight must be a string even when it is an integer value.
  else if (parseFloat(convertedValue) + '' === convertedValue) return parseFloat(convertedValue)
  else return convertedValue
}
