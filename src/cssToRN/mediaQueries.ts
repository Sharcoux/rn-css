import type { Units, Context, PartialStyle, Transform } from '../types'
import { convertValue, parseValue } from '../convertUnits'
import { PixelRatio, Platform } from '../react-native'

type Constraint = {
  all?: undefined,
  sprint?: undefined,
  speech?: undefined,
  screen?: undefined,
  width?: string
  widthMin?: string
  widthMax?: string
  height?: string
  heightMin?: string
  heightMax?: string
  aspectRatio?: string
  aspectRatioMin?: string
  aspectRatioMax?: string
  orientation?: 'portrait' | 'landscape'
  resolution?: string
  resolutionMin?: string
  resolutionMax?: string
  scan?: 'interlace' | 'progressive'
  grid?: 0 | 1
  update?: 'none' | 'slow' | 'fast'
  overflowBlock?: 'none' | 'scroll' | 'paged'
  overflowInline?: 'none' | 'scroll'
  environmentBlending?: 'opaque' | 'additive' | 'subtractive'
  color?: string
  colorMin?: string
  colorMax?: string
  colorGamut?: 'srgb' | 'p3' | 'rec2020'
  colorIndex?: string
  colorIndexMin?: string
  colorIndexMax?: string
  dynamicRange?: 'standard' | 'high'
  monochrome?: string
  monochromeMin?: string
  monochromeMax?: string
  invertedColors?: 'none' | 'inverted'
  pointer?: 'none' | 'coarse' | 'fine'
  hover?: 'none' | 'hover'
  anyPointer?: 'none' | 'coarse' | 'fine'
  anyHover?: 'none' | 'hover'
  prefersReducedMotion?: 'no-preference' | 'reduce'
  prefersReducedTransparency?: 'no-preference' | 'reduce'
  prefersReducedData?: 'no-preference' | 'reduce'
  prefersContrast?: 'no-preference' | 'high' | 'low' | 'forced'
  prefersColorScheme?: 'light' | 'dark'
  forcedColor?: 'none' | 'active'
  scripting?: 'none' | 'initial-only' | 'enabled'
  deviceWidth?: string
  deviceWidthMin?: string
  deviceWidthMax?: string
  deviceHeight?: string
  deviceHeightMin?: string
  deviceHeightMax?: string
  deviceAspectRatio?: string
  deviceAspectRatioMin?: string
  deviceAspectRatioMax?: string
}

export function createContext (units: Units): Context {
  const vw = (units.vw || 1) * 100
  const vh = (units.vh || 1) * 100
  return {
    anyHover: 'hover',
    anyPointer: Platform.OS === 'web' ? 'fine' : 'coarse',
    aspectRatio: vw / vh,
    color: 16,
    colorGamut: 'srgb',
    colorIndex: 0,
    deviceAspectRatio: vw / vh,
    deviceHeight: vh,
    deviceWidth: vw,
    dynamicRange: 'standard',
    environmentBlending: 'opaque',
    forcedColor: 'none',
    grid: 0,
    height: vh,
    hover: 'hover',
    invertedColors: 'none',
    monochrome: 0,
    orientation: vw > vh ? 'landscape' : 'portrait',
    overflowBlock: 'scroll',
    overflowInline: 'scroll',
    pointer: 'coarse',
    prefersColorScheme: 'dark',
    prefersContrast: 'no-preference',
    prefersReducedData: 'no-preference',
    prefersReducedMotion: 'no-preference',
    prefersReducedTransparency: 'no-preference',
    resolution: PixelRatio.getPixelSizeForLayoutSize(vw),
    scan: 'progressive',
    scripting: 'enabled',
    type: 'screen',
    units,
    update: 'fast',
    width: vw
  }
}

function convertAnyValue (key: keyof Context | keyof PartialStyle | keyof Transform, value: string, units: Units) {
  if (key === 'resolution') {
    // Convert density
    if (value === 'infinite') return Infinity
    const densityUnitsEquivalence = {
      dpi: 'in',
      dpcm: 'cm',
      dppx: 'px',
      x: 'px'
    }
    const [num, unit] = parseValue(value)
    return num + densityUnitsEquivalence[unit as keyof typeof densityUnitsEquivalence]
  }
  else if (key === 'deviceAspectRatio' || key === 'aspectRatio') {
    // Convert ratio
    const [w, h] = value.split('/').map(v => parseInt(v, 10))
    return w / h
  }

  return convertValue(key as keyof PartialStyle, value, units)
}

/** Check if a constraint is respected by the provided context */
function evaluateConstraint (constraint: Constraint, context: Context): boolean {
  return (Object.keys(constraint) as (keyof Constraint)[]).every(key => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [, baseKey, minMax] = key.match(/(.*?)(Min|Max|$)/)! as [string, keyof Context, 'Min' | 'Max' | '']
    const value = convertAnyValue(baseKey, constraint[key] + '', context.units)
    if (minMax === 'Min') {
      return context[baseKey] >= value
    }
    else if (key.endsWith('Max')) {
      return context[baseKey] <= value
    }
    else if (['all', 'sprint', 'speech', 'screen'].includes(key)) {
      return context.type === key || key === 'all'
    }
    else {
      // Boolean check: we want the value to be defined and not equal to 'none'
      if (value === undefined) return !!context[baseKey] && context[baseKey] !== 'none'
      // float comparison
      if (baseKey.endsWith('aspectRatio')) return Math.abs((context[baseKey] as number) - (value as number)) < ((value as number) + (context[baseKey] as number)) / 100
      return context[baseKey] === value
    }
  })
}

/** Parse media query constraint such as min-width: 600px, or screen */
function parseConstraintValue (constraintString: string): Evaluation {
  let [key, value] = constraintString.split(':').map(v => v.trim())
  if (key.startsWith('min-')) key = key.substring(4) + 'Min'
  else if (key.startsWith('max-')) key = key.substring(4) + 'Max'
  const constraint: Constraint = { [key]: value }
  return (context: Context) => evaluateConstraint(constraint, context)
}

export type Evaluation = (context: Context) => boolean

function parse (constraint: string, previous?: Evaluation): Evaluation {
  const result = constraint.match(/\sand\s|,|\sonly\s|\(|\snot\s/im)

  if (!result) {
    // If we reached the end of the string, we just return the last constraint
    if (constraint.match(/\w/)) return parseConstraintValue(constraint)
    // If there is just an empty string, we just ignore it by returning a truthy evaluation
    else return previous || (() => true)
  }

  const token = result[0] // The next command we found
  const tail = constraint.substring(result.index! + token.length) // The rest of the constraint
  const current = constraint.substring(0, result.index!) // The current constraint
  if (token === '(') {
    try {
      const { index } = tail.match(/\)/)!
      const parenthesis = tail.substring(0, index!)
      const postParenthesis = tail.substring(index! + 1)
      return parse(postParenthesis, parse(parenthesis, previous))
    }
    catch (err) {
      console.error('No matching parenthesis in the media query', constraint)
      throw err
    }
  }
  else if (token.includes('and')) {
    const left = previous || parseConstraintValue(current)
    const right = parse(tail)
    return (context: Context) => left(context) && right(context)
  }
  else if (token.includes('not')) {
    const evaluate = parse(tail)
    return (context: Context) => !evaluate(context)
  }
  else if (token.includes('only')) {
    return parse(tail, previous || parseConstraintValue(current))
  }
  else if (token === ',') {
    const left = previous || parseConstraintValue(current)
    const right = parse(tail)
    return (context: Context) => left(context) || right(context)
  }
  else {
    throw new Error(`Error while parsing media query '${constraint}'. No token found`)
  }
}

export const createMedia = (query: string) => {
  // We use [\s\S] instead of dotall flag (s) because it is not supported by react-native-windows
  const parsed = query.match(/@media([\s\S]*?){([^{}]*)}/mi)
  if (!parsed) throw new Error(`Parsing error: check the syntax of media query ${query}.`)
  const [, constraints, css] = parsed
  const isValid = parse(constraints)
  return {
    css,
    isValid
  }
}
