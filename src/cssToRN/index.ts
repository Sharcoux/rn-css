import type { Style } from '../types'
import { sideValue, border, cornerValue, font, textDecoration, shadow, placeContent, flex, flexFlow, transform } from './convert'

function kebab2camel (string: string) {
  return string.replace(/-./g, x => x.toUpperCase()[1])
}

function stripSpaces (string: string) {
  return string.replace(/calc\(.*?\)/mg, res => res.replace(/\s/g, ''))
}

function cssToStyle (css: string) {
  const result: Style = {}
  // Find hover
  const cssWithoutHover = css.replace(/&:hover\s*{(.*?)}/gmis, res => {
    result.hover = cssChunkToStyle(res.substring(0, res.length - 1).replace(/&:hover\s*{/mis, ''))
    return ''
  })
  Object.assign(result, cssChunkToStyle(cssWithoutHover))
  return result
}

function cssChunkToStyle (css: string) {
  const result: Style = {}
  css.split(/\s*;\s*/mg).forEach((entry: string) => {
    const [rawKey, rawValue] = entry.split(':')
    if (!rawValue) return
    const key = kebab2camel(rawKey.trim())
    const value = stripSpaces(rawValue.trim())// We need this to correctly read calc() values
    switch (key) {
      case 'border':
      case 'borderTop':
      case 'borderLeft':
      case 'borderRight':
      case 'borderBottom':
        Object.assign(result, border(key, value))
        break
      case 'borderWidth':
        Object.assign(result, sideValue('border', value, 'Width'))
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
      case 'place-content':
        Object.assign(result, placeContent(value))
        break
      case 'flex':
        Object.assign(result, flex(value))
        break
      case 'flex-flow':
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
      default: result[key] = value
    }
  })
  return result
}

export default cssToStyle
