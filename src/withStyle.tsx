import React from 'react'
import type { StyleMap, Style } from './types'
import cssToStyle from './cssToRN'
import calculHash from './generateHash'
import { withFontSizeUpdate, withUnits } from './readUnits'

// We use this to cache the computed styles
const styleMap: StyleMap = {}

function buildCSSString<T> (chunks: string[], functs: any[], props: T) {
  return chunks.map((chunk, i) => ([chunk, functs[i] instanceof Function ? functs[i](props) : functs[i]])).flat().join('')
}

const withStyle = <T extends {style?: any}, >(Component: React.ComponentType<T>) => (chunks: string[], ...functs: any[]) => (props: T) => {
  // Store the style for mutualization
  const cssString = React.useRef(buildCSSString(chunks, functs, props))
  // const rnStyle = React.useRef<Style>(cssToStyle(cssString.current))
  const [rnStyle, setRNStyle] = React.useState<Style>(cssToStyle(cssString.current))
  React.useLayoutEffect(() => {
    // Build the css string with the context
    const css = buildCSSString(chunks, functs, props)
    cssString.current = css
    // Try to load an existing style from the style map or save it for next time
    const hash = calculHash(css)
    const style = styleMap[hash]
    if (style) {
      // rnStyle.current = style.style
      setRNStyle(style.style)
      style.usages++
    } else {
      const rns = cssToStyle(css)
      // rnStyle.current = rns
      setRNStyle(rns)
      styleMap[hash] = { style: rns, usages: 1 }
    }
    // When the style is not used anymore, we destroy it
    return () => {
      const style = styleMap[hash]
      style.usages--
      if (style.usages <= 0) delete styleMap[hash]
    }
  }, [props])

  let FinalComponent = withUnits(Component as React.ComponentType<T & {rnStyle: Style}>, cssString.current)

  // Check if fontSize is being set, because we need to update it right away in this case
  // const fontSize = (props.style || {}).fontSize || rnStyle.current.fontSize
  const fontSize = (props.style || {}).fontSize || rnStyle.fontSize
  if (fontSize) FinalComponent = withFontSizeUpdate(FinalComponent)

  // return <FinalComponent {...props} rnStyle={rnStyle.current} />
  return <FinalComponent {...props} rnStyle={rnStyle} />
}

export default withStyle
