import type { Units } from '../types'
import { convertValue, parseValue } from '../convertUnits'

const RE_MEDIA_QUERY = /^(?:(only|not)?\s*([_a-z][_a-z0-9-]*)|(\([^\)]+\)))(?:\s*and\s*(.*))?$/i
const RE_MQ_EXPRESSION = /^\(\s*([_a-z-][_a-z0-9-]*)\s*(?:\:\s*([^\)]+))?\s*\)$/
const RE_MQ_FEATURE = /^(?:(min|max)-)?(.+)/
const RE_LENGTH_UNIT = /(em|rem|px|cm|mm|in|pt|pc)?\s*$/
const RE_RESOLUTION_UNIT = /(dpi|dpcm|dppx)?\s*$/

type Context = {
  width: number
  height: number
  aspectRatio: number
  orientation: 'portrait' | 'landscape'
  resolution: number
  scan: 'interlace' | 'progressive'
  grid: 0 | -0 | 1
  update: 'none' | 'slow' | 'fast'
  overflowBlock: 'none' | 'scroll' | 'paged'
  overflowInline: 'none' | 'scroll'
  environmentBlending: 'opaque' | 'additive' | 'subtractive'
  color: number
  colorGamut: 'srgb' | 'p3' | 'rec2020'
  colorIndex: number
  displayMode: number
  dynamicRange: 'standard' | 'high'
  monochrome: number
  invertedColors: 'none' | 'inverted'
  pointer: 'none' | 'coarse' | 'fine'
  hover: 'none' | 'hover'
  anyPointer: 'none' | 'coarse' | 'fine'
  anyHover: 'none' | 'hover'
  lightLevel: number
  prefersReducedMotion: 'no-preference' | 'reduce'
  prefersReducedTransparency: 'no-preference' | 'reduce'
  prefersReducedData: 'no-preference' | 'reduce'
  prefersContrast: 'no-preference' | 'high' | 'low' | 'forced'
  prefersColorScheme: 'light' | 'dark'
  forcedColor: 'none' | 'active'
  scripting: 'none' | 'initial-only' | 'enabled'
  deviceWidth: number
  deviceHeight: number
  deviceAspectRatio: number
  units: Units
}

type Constraint = {
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
  grid?: 0 | -0 | 1
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
  displayMode?: string
  displayModeMin?: string
  displayModeMax?: string
  dynamicRange?: 'standard' | 'high'
  monochrome?: string
  monochromeMin?: string
  monochromeMax?: string
  invertedColors?: 'none' | 'inverted'
  pointer?: 'none' | 'coarse' | 'fine'
  hover?: 'none' | 'hover'
  anyPointer?: 'none' | 'coarse' | 'fine'
  anyHover?: 'none' | 'hover'
  lightLevel?: string
  lightLevelMin?: string
  lightLevelMax?: string
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

type Group = {
  content: Group,
  evaluate: (context: Context) => boolean
}

function evaluateConstraint (constraint: Constraint, context: Context) {
  (Object.keys(constraint) as (keyof Constraint)[]).map(key => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [, baseKey, minMax] = key.match(/(.*?)(Min|Max|$)/)! as [string, keyof Context, 'Min' | 'Max' | '']
    const value = convertValue(baseKey, constraint[key] + '', context.units)
    if (minMax === 'Min') {
      return context[baseKey] > value
    }
    else if (key.endsWith('Max')) {
      return context[baseKey] < value
    }
    else {
      // Boolean check: we want the value to be defined and not equal to 'none'
      if (value === '') return !!context[baseKey] && context[baseKey] !== 'none'
      return context[baseKey] === value
    }
  })
}

function evaluateQuery (context: Context, group: Group) {
  return group.evaluate(context)
}

type Evaluation = (context: Context) => boolean

function or (evaluations: Evaluation[]): Evaluation {
  return (context: Context) => !!evaluations.find(e => e(context))
}
function and (evaluations: Evaluation[]): Evaluation {
  return (context: Context) => evaluations.every(e => e(context))
}
function not (evaluation: Evaluation): Evaluation {
  return (context: Context) => !evaluation(context)
}
function group(parent: Evaluation | null): Evaluation {
  return (context: Context) => 
}

const currentGroup = { parent: null }

function parse (constraint: string): Evaluation {
  const trim = constraint.trim()
  if(trim.startsWith('(')) {
    parse(constraint.substring(1))
    const [, inner] = trim.match(/\(([^()]*\([^()]*\))*[^()]*\)/mis)
  } else if(trim.startsWith(')')) {
    if(currentGroup.parent) currentGroup = currentGroup.parent
    else return currentGroup
  }
}

function Group (inner) {
  this.content = parse(inner)
}
Group.prototype.evaluate = function (context) {

}

const densityUnitsEquivalence = {
  dpi: 'in',
  dpcm: 'cm',
  dppx: 'px',
  x: 'px'
}

function convertDensityUnits (value: string, units: Units) {
  if (value === 'infinite') return Infinity
  const [num, unit] = parseValue(value)
  return convertValue('resolution', num + densityUnitsEquivalence[unit as keyof typeof densityUnitsEquivalence], units)
}

const createMedia = (query: string) => {
  let parse = query.match(/@media(.*?){([^{}]*{[^{}]*})*[^{}]*}/mis)
  if (!parse) return
  const [, constraints, instructions] = parse
  parse = constraints.match(/\s*(screen)/)
  return config => isValid(config) ? instructions : ''
}

export function matchQuery (mediaQuery: string, values: Value, units: Units) {
  return parseQuery(mediaQuery).some((query: MediaParsedValue) => {
    const inverse = query.inverse

    // Either the parsed or specified `type` is "all", or the types must be
    // equal for a match.
    const typeMatch = query.type === 'all' || values.type === query.type

    // Quit early when `type` doesn't match, but take "not" into account.
    if ((typeMatch && inverse) || !(typeMatch || inverse)) {
      return false
    }

    const expressionsMatch = query.expressions.every(expression => {
      const feature = expression.feature
      const modifier = expression.modifier
      let expValue = expression.value
      let value = values[feature]

      // Missing or falsy values don't match.
      if (!value) { return false }

      switch (feature) {
        case 'orientation':
        case 'scan':
          return value.toLowerCase() === expValue.toLowerCase()

        case 'width':
        case 'height':
        case 'device-width':
        case 'device-height':
          expValue = toPx(expValue)
          value = toPx(value)
          break

        case 'resolution':
          expValue = toDpi(expValue)
          value = toDpi(value)
          break

        case 'aspect-ratio':
        case 'device-aspect-ratio':
        case /* Deprecated */ 'device-pixel-ratio':
          expValue = toDecimal(expValue)
          value = toDecimal(value)
          break

        case 'grid':
        case 'color':
        case 'color-index':
        case 'monochrome':
          expValue = parseInt(expValue, 10) || 1
          value = parseInt(value, 10) || 0
          break
      }

      switch (modifier) {
        case 'min': return value >= expValue
        case 'max': return value <= expValue
        default : return value === expValue
      }
    })

    return (expressionsMatch && !inverse) || (!expressionsMatch && inverse)
  })
}

function parseQuery (mediaQuery) {
  return mediaQuery.split(',').map(query => {
    query = query.trim()

    const captures = query.match(RE_MEDIA_QUERY)

    // Media Query must be valid.
    if (!captures) {
      throw new SyntaxError('Invalid CSS media query: "' + query + '"')
    }

    const modifier = captures[1]
    const type = captures[2]
    let expressions = ((captures[3] || '') + (captures[4] || '')).trim()
    const parsed = {}

    parsed.inverse = !!modifier && modifier.toLowerCase() === 'not'
    parsed.type = type ? type.toLowerCase() : 'all'

    // Check for media query expressions.
    if (!expressions) {
      parsed.expressions = []
      return parsed
    }

    // Split expressions into a list.
    expressions = expressions.match(/\([^\)]+\)/g)

    // Media Query must be valid.
    if (!expressions) {
      throw new SyntaxError('Invalid CSS media query: "' + query + '"')
    }

    parsed.expressions = expressions.map(function (expression) {
      const captures = expression.match(RE_MQ_EXPRESSION)

      // Media Query must be valid.
      if (!captures) {
        throw new SyntaxError('Invalid CSS media query: "' + query + '"')
      }

      const feature = captures[1].toLowerCase().match(RE_MQ_FEATURE)

      return {
        modifier: feature[1],
        feature: feature[2],
        value: captures[2]
      }
    })

    return parsed
  })
}

// -- Utilities ----------------------------------------------------------------

function toDecimal (ratio) {
  let decimal = Number(ratio)
  let numbers

  if (!decimal) {
    numbers = ratio.match(/^(\d+)\s*\/\s*(\d+)$/)
    decimal = numbers[1] / numbers[2]
  }

  return decimal
}

function toDpi (resolution) {
  const value = parseFloat(resolution)
  const units = String(resolution).match(RE_RESOLUTION_UNIT)[1]

  switch (units) {
    case 'dpcm': return value / 2.54
    case 'dppx': return value * 96
    default : return value
  }
}

function toPx (length) {
  const value = parseFloat(length)
  const units = String(length).match(RE_LENGTH_UNIT)[1]

  switch (units) {
    case 'em' : return value * 16
    case 'rem': return value * 16
    case 'cm' : return value * 96 / 2.54
    case 'mm' : return value * 96 / 2.54 / 10
    case 'in' : return value * 96
    case 'pt' : return value * 72
    case 'pc' : return value * 72 / 12
    default : return value
  }
}

type MediaCriteria = {
  color?: string;
  colorIndex?: number;
  deviceAspectRatio?: string;
  aspectRation?: string;
  deviceHeight?: string;
  deviceWidth?: string;
  grid?: string;
  height?: string;
  monochrome?: string;
  orientation?: 'portrait' | 'landscape';
  resolution?: string;
  scan?: 'progressive' | 'interlace';
  width?: string;
}
type Value = {
  type: MediaType
  color?: number;
  colorIndex?: number;
  deviceAspectRatio?: number;
  aspectRation?: number;
  deviceHeight?: number;
  deviceWidth?: number;
  grid?: number;
  height?: number;
  monochrome?: number | boolean;
  orientation?: 'portrait' | 'landscape';
  resolution?: number;
  scan?: 'progressive' | 'interlace';
  width?: number;
}
type MediaValue = {
  type: MediaType;
  inverse?: boolean;
  only?: boolean;
  modifier?: 'min' | 'max';
  value: string;
  criteria: keyof MediaCriteria
}
type MediaParsedValue = {
  type: MediaType;
  expressions: MediaValue[];
}

type MediaType = 'all' | 'screen' | 'print' | 'handheld' | 'aural' | 'speech' | 'braille' | 'embossed' | 'projection' | 'tty' | 'tv'

function createMedia (mediaString: string) {
  const media = mediaString.trim().match(/(.*?) ((and|only|)/gmis)
}
