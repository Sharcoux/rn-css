import type { Style } from '../types'

/** Check if the value is a number. Numbers start with a digit, a decimal point or calc( */
function isNumber (value: string) {
  return value.match(/^[+-]?(\.\d|\d|calc\()/mg)
}

/** Split the value into numbers values and non numbers values */
function findNumbers (value: string) {
  const result = {
    nonNumbers: [] as string[],
    numbers: [] as string[]
  }
  value.split(/\s+/mg).forEach(val => result[isNumber(val) ? 'numbers' : 'nonNumbers'].push(val))
  return result
}

/** Parse a css value for border */
export function border (prefixKey: 'border' | 'borderLeft' | 'borderRight' | 'borderTop' | 'borderBottom', value: string) {
  const values = value.split(/\s+/mg)
  const result = {
    [prefixKey + 'Width']: '0',
    [prefixKey + 'Color']: 'black',
    [prefixKey + 'Style']: 'solid'
  }
  values.forEach((value: string) => {
    if (['solid', 'dotted', 'dashed'].includes(value)) result[prefixKey + 'Style'] = value
    else if (isNumber(value)) result[prefixKey + 'Width'] = value
    else result[prefixKey + 'Color'] = value
  })
  return result
}

export function shadow (prefix: 'textShadow' | 'shadow', value: string): { [x:string]: any } {
  if (value === 'none') return shadow(prefix, '0 0 0 black')
  const { nonNumbers, numbers } = findNumbers(value)
  return {
    [prefix + 'Offset']: { width: numbers[0] || 0, height: numbers[1] || 0 },
    [prefix + 'Radius']: numbers[2] || 0,
    [prefix + 'Color']: nonNumbers[0] || 'black'
  }
}

export function flex (value: string) {
  const [flexGrow, flexShrink = '0', flexBasis = '0'] = value.split(/\s/g)
  // If the only property is a not a number, its value is flexBasis. See https://developer.mozilla.org/en-US/docs/Web/CSS/flex
  if ((parseFloat(flexGrow) + '') !== flexGrow) return { flexBasis: flexGrow }
  // If the second property is not a number, its value is flexBasis.
  if (((parseFloat(flexShrink) + '') !== flexShrink)) return { flexGrow, flexBasis: flexShrink }
  return {
    flexGrow, flexShrink, flexBasis
  }
}

export function flexFlow (value: string) {
  const values = value.split(/\s/g)
  const result = {} as {[prop: string]: string}
  values.forEach(val => {
    if (['wrap', 'nowrap', 'wrap-reverse'].includes(val)) result.flexWrap = val
    else if (['row', 'column', 'row-reverse', 'column-reverse'].includes(val)) result.flexDirection = val
  })
  return result
}

export function placeContent (value: string) {
  const [alignContent, justifyContent = alignContent] = value.split(/\s/g)
  return { alignContent, justifyContent }
}

export function textDecoration (value: string) {
  const values = value.split(/\s+/mg)
  const result = {
    textDecorationStyle: 'solid',
    textDecorationColor: 'black'
  }
  values.forEach(value => {
    if (['solid', 'double', 'dotted', 'dashed'].includes(value)) result.textDecorationStyle = value
    else result.textDecorationColor = value
  })
  return result
}

function read2D (prefix: 'translate' | 'scale' | 'skew', value: string) {
  const [x, y] = value.split(',').map(val => val.trim())
  return {
    [prefix + 'X']: x,
    [prefix + 'Y']: y
  }
}

function read3D (prefix: 'rotate', value: string) {
  const [x, y, z] = value.split(',').map(val => val.trim())
  return {
    [prefix + 'X']: x,
    [prefix + 'Y']: y,
    [prefix + 'Z']: z
  }
}

export function transform (value: string) {
  // Parse transform operations
  const transform = [...value.matchAll(/(\w+)\((.*?)\)/gm)].map(val => {
    const operation = val[1]
    const values = val[2].trim()
    if (['translate', 'scale', 'skew'].includes(operation)) return read2D(operation as 'translate' | 'scale' | 'skew', values)
    else if (operation === 'rotate3d') return read3D('rotate', values)
    else return { [operation]: values }
  })
  return { transform }
}

export function font (value: string) {
  const { nonNumbers, numbers } = findNumbers(value)
  const result: Style = {
    fontStyle: 'normal',
    fontWeight: 'normal' as string
  }
  for (let i = 0; i < nonNumbers.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const val = nonNumbers.shift()!
    if (val === 'italic') result.fontStyle = val
    else if (val === 'bold') result.fontWeight = val
    else if (val === 'normal') continue// can be both fontStyle or fontWeight, but as it is the default we can just ignore.
    else if (['small-caps', 'oldstyle-nums', 'lining-nums', 'tabular-nums', 'proportional-nums'].includes(val)) result.fontVariant = val
    else {
      nonNumbers.unshift(val)
      break
    }
  }
  // The font family is the last property and can contain spaces
  if (nonNumbers.length > 0) result.fontFamily = nonNumbers.join(' ')

  // The font size is always defined and is the last number
  const size = numbers.pop()
  if (!size) return result
  const [fontSize, lineHeight] = size.split('/') // We can define the line height like this : fontSize/lineHeight
  result.fontSize = fontSize
  if (lineHeight) result.lineHeight = lineHeight
  // The font size is always after the font weight
  if (numbers.length) result.fontWeight = numbers[0]

  return result
}

/** Parses a css value for the side of an element (border-width, margin, padding) */
export function sideValue (prefixKey: 'padding' | 'margin' | 'border', value: string, postFix: 'Width' | '' = '') {
  const [top, left = top, bottom = top, right = left] = findNumbers(value).numbers
  return {
    [prefixKey + 'Top' + postFix]: top,
    [prefixKey + 'Left' + postFix]: left,
    [prefixKey + 'Right' + postFix]: right,
    [prefixKey + 'Bottom' + postFix]: bottom
  }
}

/** Parses a css value for the corner of an element (border-radius) */
export function cornerValue (prefixKey: 'border', value: string, postFix: 'Radius') {
  const [topLeft, topRight = topLeft, bottomRight = topLeft, bottomLeft = topRight] = findNumbers(value).numbers
  return {
    [prefixKey + 'TopLeft' + postFix]: topLeft,
    [prefixKey + 'TopRight' + postFix]: topRight,
    [prefixKey + 'BottomLeft' + postFix]: bottomLeft,
    [prefixKey + 'BottomRight' + postFix]: bottomRight
  }
}
