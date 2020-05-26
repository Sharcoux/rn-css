/* eslint-disable react/display-name */
import React from 'react'
import type { StyleMap, Style } from './types'
import cssToStyle from './cssToRN'
import calculHash from './generateHash'
import { withUnits } from './readUnits'
import { withFontSizeUpdate } from './features'
import { TextStyle } from 'react-native'

// We use this to cache the computed styles
const styleMap: StyleMap = {}

function buildCSSString<T extends { rnCSS?: string }> (chunks: TemplateStringsArray, functs: ((props: T & { rnCSS?: string }) => any | any)[], props: T) {
  let computedString = chunks.map((chunk, i) => ([chunk, functs[i] instanceof Function ? functs[i](props) : functs[i]])).flat().join('')
  if (props.rnCSS) computedString += props.rnCSS.replace(/=/gm, ':') + ';'
  return computedString
}

const withStyle = <Props, >(Component: React.ComponentType<Props>) => {
  const styledComponent = <S, >(chunks: TemplateStringsArray, ...functs: ((props: S & Props & { rnCSS?: string }) => any | any)[]) => {
    return React.forwardRef<React.ComponentType<S & Props & { rnCSS?: string; children?: React.ReactNode }>, S & Props & { rnCSS?: string; children?: React.ReactNode }>((props: S & Props & { rnCSS?: string; children?: React.ReactNode }, ref) => {
      // If one of our reserved keys is used we need to warn the user
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (props.rnStyle || props.units) throw new Error('The props rnStyle and units are reserved for rn-css and should not be used')

      // Store the style for mutualization
      const cssString = React.useRef(buildCSSString(chunks, functs, props))
      const [rnStyle, setRNStyle] = React.useState<Style>(cssToStyle(cssString.current))
      React.useEffect(() => {
      // Build the css string with the context
        const css = buildCSSString(chunks, functs, props)
        cssString.current = css
        // Try to load an existing style from the style map or save it for next time
        const hash = calculHash(css)
        const style = styleMap[hash]
        if (style) {
          setRNStyle(style.style)
          style.usages++
        } else {
          const rns = cssToStyle(css)
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

      let FinalComponent = withUnits<Props>(Component, cssString.current) as React.ForwardRefExoticComponent<Props>

      // Check if fontSize is being set, because we need to update it right away in this case
      // const fontSize = (props.style || {}).fontSize || rnStyle.current.fontSize
      const fontSize = ((props as Props & { style?: TextStyle }).style || {}).fontSize || rnStyle.fontSize
      if (fontSize) FinalComponent = withFontSizeUpdate<Props & { rnStyle: Style }>(FinalComponent as React.ComponentType<Props & { rnStyle: Style }>) as React.ForwardRefExoticComponent<Props>

      // return <FinalComponent {...props} rnStyle={rnStyle.current} />
      return <FinalComponent ref={ref} {...props} rnStyle={rnStyle} />
    })
  }

  // provide withStyle(Comp).attrs({} | () => {}) feature
  styledComponent.attrs = (opts: ((prop: Props) => any) | any) => <S, >(chunks: TemplateStringsArray, ...functs: (((prop: Props & S & { rnCSS?: string }) => any) | any)[]) => React.forwardRef<React.ComponentType<S & Props & {children?: React.ReactNode }>, S & Props & { children?: React.ReactNode }>((props: Props & S, ref) => {
    const attrs = (opts instanceof Function) ? opts(props) : opts
    const ComponentWithAttrs = styledComponent(chunks, ...functs)
    return <ComponentWithAttrs {...props} {...attrs} ref={ref} />
  })

  return styledComponent
}

export default withStyle
