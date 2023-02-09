import { Dimensions } from 'react-native'
import convertStyle from '../convertStyle'
import { CompleteStyle, Context, PartialStyle, Style, Units } from '../types'
import { sideValue, border, borderLike, cornerValue, font, textDecoration, shadow, placeContent, flex, flexFlow, transform, background } from './convert'
import { createMedia } from './mediaQueries'

function kebab2camel (string: string) {
  return string.replace(/-./g, x => x.toUpperCase()[1])
}

function stripSpaces (string: string) {
  return string.replace(/(calc|max|min|rgb|rgba)\(.*?\)/mg, res => res.replace(/\s/g, ''))
}

function cssToStyle (css: string) {
  const result: Style = {}
  // Find media queries (We use [\s\S] instead of . because dotall flag (s) is not supported by react-native-windows)
  const cssWithoutMediaQueries = css.replace(/@media([\s\S]*?){[^{}]*}/gmi, res => {
    const { css, isValid } = createMedia(res)
    const style = cssChunkToStyle(css)
    const mediaQuery = (context: Context) => isValid(context) && style
    if (!result.media) result.media = []
    result.media!.push(mediaQuery)
    return ''
  })
  // Find hover (we don't support hover within media queries) (We use [\s\S] instead of . because dotall flag (s) is not supported by react-native-windows)
  const cssWithoutHover = cssWithoutMediaQueries.replace(/&:hover\s*{([\s\S]*?)}/gmi, res => {
    const hoverInstructions = res.substring(0, res.length - 1).replace(/&:hover\s*{/mi, '')// We remove the `&:hover {` and `}`
    result.hover = cssChunkToStyle(hoverInstructions)
    return ''
  })
  Object.assign(result, cssChunkToStyle(cssWithoutHover))
  return result
}

export function cssToRNStyle (css: string, units: { em?: number, width?: number, height?: number } = {}) {
  const { width, height } = Dimensions.get('window')
  const finalUnits: Units = {
    em: 16,
    '%': 0.01,
    vw: width / 100,
    vh: height / 100,
    vmin: Math.min(width, height) / 100,
    vmax: Math.max(width, height) / 100,
    width: 100,
    height: 100,
    rem: 16,
    px: 1,
    pt: 96 / 72,
    in: 96,
    pc: 16,
    cm: 96 / 2.54,
    mm: 96 / 25.4,
    ...units
  }
  const rnStyle = cssChunkToStyle(css)
  return convertStyle<CompleteStyle>(rnStyle, finalUnits)
}

function cssChunkToStyle (css: string) {
  const result: PartialStyle = {}
  css.split(/\s*;\s*(?!base64)/mg).forEach((entry: string) => {
    const [rawKey, ...rest] = entry.split(':')
    const rawValue = rest.join(':')
    if (!rawValue) return
    const key = kebab2camel(rawKey.trim())
    const value = stripSpaces(rawValue.trim())// We need this to correctly read calc() values
    switch (key) {
      case 'border':
        Object.assign(result, border(value))
        break
      case 'borderTop':
      case 'borderLeft':
      case 'borderRight':
      case 'borderBottom':
      case 'outline':
        Object.assign(result, borderLike(key, value))
        break
      case 'borderStyle':
      case 'borderColor':
      case 'borderWidth':
        Object.assign(result, sideValue('border', value, key.split('border').pop() as '' | 'Width' | 'Style' | 'Color'))
        break
      case 'background':
        Object.assign(result, background(value))
        break
      case 'padding':
      case 'margin':
        Object.assign(result, sideValue(key, value))
        break
      case 'borderRadius':
        Object.assign(result, cornerValue('border', value, 'Radius'))
        break
      case 'font':
        Object.assign(result, font(value))
        break
      case 'textDecoration':
        Object.assign(result, textDecoration(value))
        break
      case 'placeContent':
        Object.assign(result, placeContent(value))
        break
      case 'flex':
        Object.assign(result, flex(value))
        break
      case 'flexFlow':
        Object.assign(result, flexFlow(value))
        break
      case 'transform':
        Object.assign(result, transform(value))
        break
      case 'boxShadow':
      case 'textShadow':
        // We need to replace boxShadow by shadow
        Object.assign(result, shadow(key === 'boxShadow' ? 'shadow' : key, value))
        break
      // Other keys don't require any special treatment
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      default: result[key] = value
    }
  })
  return result
}

export default cssToStyle
