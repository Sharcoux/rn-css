import { Platform } from '../react-native'
import type { Style, Transform } from '../types'

/**
 * Check if the value is a number. Numbers start with a digit, a decimal point or calc(, max( ou min(.
 * Optionally accept "auto" value (for margins)
 * @param value The value to check
 * @param acceptAuto true if auto is an accepted value
 * @returns true if the value is a number
 */
function isNumber (value: string, acceptAuto?: boolean) {
  if (acceptAuto && value === 'auto') return true
  return value.match(/^[+-]?(\.\d|\d|calc\(|max\(|min\()/mg)
}

/**
 * Check if the value is a number. Numbers start with a digit, a decimal point or calc(, max( ou min(.
 * Optionally accept "auto" value (for margins)
 * @param value The value to check
 * @param acceptAuto true if auto is an accepted value
 * @returns true if the value is a number
 */
/**
 * Split the value into numbers values and non numbers values
 * @param value The value to check
 * @param acceptAuto true if auto is an accepted value
 * @returns An object containing the number and non number values as arrays.
 */
function findNumbers (value: string, acceptAuto?: boolean) {
  const result = {
    nonNumbers: [] as string[],
    numbers: [] as string[]
  }
  let group = ''
  value.split(/\s+/mg).forEach(val => {
    // HACK: we prevent some parts of font-family names like "Rounded Mplus 1c" to be interpreted as numbers
    if (val.startsWith('"') || val.startsWith("'")) group = val.charAt(0)
    if (group && val.endsWith(group)) group = ''
    if (group) result.nonNumbers.push(val)
    else result[isNumber(val, acceptAuto) ? 'numbers' : 'nonNumbers'].push(val)
  })
  return result
}

/** Parse a css value for border */
export function border (value: string): { [x:string]: string } {
  const values = value.split(/\s+/mg)
  const result = {
    borderWidth: '0',
    borderColor: 'black',
    borderStyle: 'solid'
  }
  values.forEach((value: string) => {
    if (['solid', 'dotted', 'dashed'].includes(value)) result.borderStyle = value
    else if (isNumber(value)) result.borderWidth = value
    // eslint-disable-next-line no-useless-return
    else if (value === 'none') return
    else result.borderColor = value
  })
  return {
    ...sideValue('border', result.borderWidth, 'Width'),
    ...sideValue('border', result.borderColor, 'Color'),
    ...sideValue('border', result.borderStyle, 'Style')
  }
}

/** Parse a css value for border-like elements */
export function borderLike (prefixKey: 'outline' | 'borderLeft' | 'borderRight' | 'borderTop' | 'borderBottom', value: string): { [x:string]: string } {
  const values = value.split(/\s+/mg)
  const result = {
    [prefixKey + 'Width']: '0',
    [prefixKey + 'Color']: 'black',
    [prefixKey + 'Style']: 'solid'
  }
  if (value === 'none') return result
  values.forEach((value: string) => {
    if (['solid', 'dotted', 'dashed'].includes(value)) result[prefixKey + 'Style'] = value
    else if (isNumber(value)) result[prefixKey + 'Width'] = value
    else result[prefixKey + 'Color'] = value
  })
  return result
}

export function shadow (prefix: 'textShadow' | 'shadow', value: string): { [x:string]: string | { width: string, height: string } } {
  if (value === 'none') return shadow(prefix, '0 0 0 black')
  const { nonNumbers, numbers } = findNumbers(value)
  return {
    [prefix + 'Offset']: { width: numbers[0] || '0', height: numbers[1] || '0' },
    [prefix + 'Radius']: numbers[2] || '0',
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

export function background (value: string) {
  const values = value.split(/\s+/mg)
  const color = values.pop()
  const backgroundColor = isColor(color) ? color : 'transparent'
  // We support everything on web
  return Platform.OS === 'web' ? { backgroundColor, background: value } : { backgroundColor }
}

export function textDecoration (value: string) {
  const values = value.split(/\s+/mg)
  const result = {
    textDecorationLine: 'none',
    textDecorationStyle: 'solid',
    textDecorationColor: 'black'
  }
  values.forEach(value => {
    if (['none', 'solid', 'double', 'dotted', 'dashed'].includes(value)) result.textDecorationStyle = value
    else if (['none', 'underline', 'line-through'].includes(value)) {
      // To accept 'underline line-throught' as a value, we need to concatenate
      if (result.textDecorationLine !== 'none') result.textDecorationLine += ' ' + value
      else result.textDecorationLine = value
    }
    else result.textDecorationColor = value
  })
  return result
}

function read2D (prefix: 'translate' | 'scale' | 'skew', value: string) {
  const [x, y = x] = value.split(',').map(val => val.trim()) as string[]
  return [
    { [prefix + 'X']: x },
    { [prefix + 'Y']: y }
  ]
}

function read3D (prefix: 'rotate', value: string): Transform[] {
  const [x, y, z] = value.split(',').map(val => val.trim())
  const transform = []
  if (x) transform.push({ [prefix + 'X']: x })
  if (y) transform.push({ [prefix + 'Y']: y })
  if (z) transform.push({ [prefix + 'Z']: z })
  return transform
}

export function transform (value: string) {
  // Parse transform operations
  const transform = [...value.matchAll(/(\w+)\((.*?)\)/gm)].reduce((acc, val) => {
    const operation = val[1]
    const values = val[2].trim()
    if (['translate', 'scale', 'skew'].includes(operation)) return acc.concat(read2D(operation as 'translate' | 'scale' | 'skew', values))
    else if (operation === 'rotate3d') return acc.concat(read3D('rotate', values))
    else return acc.concat({ [operation]: values })
  }, [] as Transform[])
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
export function sideValue <T extends 'padding' | 'margin' | 'border'> (prefixKey: T, value: string, postFix: T extends 'border' ? 'Width' | 'Style' | 'Color' | '' : '' = ''): { [x: string]: string} {
  if (value === 'none') return sideValue(prefixKey, '0', postFix)
  const [top = value, right = top, bottom = top, left = right] = findNumbers(value, prefixKey === 'margin').numbers
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

function isColor (value?: string) {
  if (!value) return false
  if (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl')) return true
  const CSS_COLOR_NAMES = [
    'aliceblue',
    'antiquewhite',
    'aqua',
    'aquamarine',
    'azure',
    'beige',
    'bisque',
    'black',
    'blanchedalmond',
    'blue',
    'blueviolet',
    'brown',
    'burlywood',
    'cadetblue',
    'chartreuse',
    'chocolate',
    'coral',
    'cornflowerblue',
    'cornsilk',
    'crimson',
    'cyan',
    'darkblue',
    'darkcyan',
    'darkgoldenrod',
    'darkgray',
    'darkgrey',
    'darkgreen',
    'darkkhaki',
    'darkmagenta',
    'darkolivegreen',
    'darkorange',
    'darkorchid',
    'darkred',
    'darksalmon',
    'darkseagreen',
    'darkslateblue',
    'darkslategray',
    'darkslategrey',
    'darkturquoise',
    'darkviolet',
    'deeppink',
    'deepskyblue',
    'dimgray',
    'dimgrey',
    'dodgerblue',
    'firebrick',
    'floralwhite',
    'forestgreen',
    'fuchsia',
    'gainsboro',
    'ghostwhite',
    'gold',
    'goldenrod',
    'gray',
    'grey',
    'green',
    'greenyellow',
    'honeydew',
    'hotpink',
    'indianred',
    'indigo',
    'ivory',
    'khaki',
    'lavender',
    'lavenderblush',
    'lawngreen',
    'lemonchiffon',
    'lightblue',
    'lightcoral',
    'lightcyan',
    'lightgoldenrodyellow',
    'lightgray',
    'lightgrey',
    'lightgreen',
    'lightpink',
    'lightsalmon',
    'lightseagreen',
    'lightskyblue',
    'lightslategray',
    'lightslategrey',
    'lightsteelblue',
    'lightyellow',
    'lime',
    'limegreen',
    'linen',
    'magenta',
    'maroon',
    'mediumaquamarine',
    'mediumblue',
    'mediumorchid',
    'mediumpurple',
    'mediumseagreen',
    'mediumslateblue',
    'mediumspringgreen',
    'mediumturquoise',
    'mediumvioletred',
    'midnightblue',
    'mintcream',
    'mistyrose',
    'moccasin',
    'navajowhite',
    'navy',
    'oldlace',
    'olive',
    'olivedrab',
    'orange',
    'orangered',
    'orchid',
    'palegoldenrod',
    'palegreen',
    'paleturquoise',
    'palevioletred',
    'papayawhip',
    'peachpuff',
    'peru',
    'pink',
    'plum',
    'powderblue',
    'purple',
    'rebeccapurple',
    'red',
    'rosybrown',
    'royalblue',
    'saddlebrown',
    'salmon',
    'sandybrown',
    'seagreen',
    'seashell',
    'sienna',
    'silver',
    'skyblue',
    'slateblue',
    'slategray',
    'slategrey',
    'snow',
    'springgreen',
    'steelblue',
    'tan',
    'teal',
    'thistle',
    'tomato',
    'turquoise',
    'violet',
    'wheat',
    'white',
    'whitesmoke',
    'yellow',
    'yellowgreen'
  ]
  return CSS_COLOR_NAMES.includes(value)
}
