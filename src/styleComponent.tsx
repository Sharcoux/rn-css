/* eslint-disable react/display-name */
import React, { MouseEvent } from 'react'
import type { StyleMap, Style, Units } from './types'
import cssToStyle from './cssToRN'
import calculHash from './generateHash'
import { useLayout, useScreenSize, useFontSize, useHover, FontSizeContext, useZIndex } from './features'
import convertStyle from './convertStyle'
import { LayoutChangeEvent, StyleProp, StyleSheet } from 'react-native'

// We use this to cache the computed styles
const styleMap: StyleMap = {}

function buildCSSString<T extends { rnCSS?: string }> (chunks: TemplateStringsArray, functs: ((props: T & { rnCSS?: string }) => any | any)[], props: T) {
  let computedString = chunks.map((chunk, i) => ([chunk, functs[i] instanceof Function ? functs[i](props) : functs[i]])).flat().join('')
  if (props.rnCSS) computedString += props.rnCSS.replace(/=/gm, ':') + ';'
  return computedString
}
const styled = <Props, >(Component: React.ComponentType<Props>) => {
  const styledComponent = <S, >(chunks: TemplateStringsArray, ...functs: ((props: S & Props & { rnCSS?: string }) => any | any)[]) => {
    type ComponentProps = S & Props & {
      rnCSS?: string;
      children?: React.ReactNode;
      onMouseEnter?: (event: MouseEvent) => void;
      onMouseLeave?: (event: MouseEvent) => void;
      onLayout?: (event: LayoutChangeEvent) => void
      style?: StyleProp<any>;
    }
    return React.forwardRef<React.ComponentType<ComponentProps>, ComponentProps>((props: ComponentProps, ref) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      React.useEffect(() => console.log('mount') || (() => console.log('unmount')), [])

      const units = React.useRef<Units>({ em: 16, vw: 1, vh: 1, vmin: 1, vmax: 1, width: 1, height: 1, rem: 16, px: 1, pt: 72 / 96, in: 96, pc: 9, cm: 96 / 2.54, mm: 96 / 25.4 })

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
          finalStyle.current = style.style
          style.usages++
        } else {
          const rns = cssToStyle(css)
          setRNStyle(rns)
          finalStyle.current = rns
          styleMap[hash] = { style: rns, usages: 1 }
        }
        // When the style is not used anymore, we destroy it
        return () => {
          const style = styleMap[hash]
          style.usages--
          if (style.usages <= 0) delete styleMap[hash]
        }
      }, [props])

      const [needsFontSize, setNeedsFontSize] = React.useState(false)
      const [needsScreenSize, setNeedsScreenSize] = React.useState(false)
      const [needsLayout, setNeedsLayout] = React.useState(false)
      const [needsHover, setNeedsHover] = React.useState(false)
      React.useEffect(() => {
        const css = cssString.current
        setNeedsFontSize(!!css.match(/\b(\d+)(\.\d+)?em\b/)) // Do we need em units
        setNeedsScreenSize(!!css.match(/\b(\d+)(\.\d+)?v([hw]|min|max)\b/)) // Do we need vx units
        setNeedsLayout(!!css.match(/\d%/)) // Do we need % units
        setNeedsHover(!!css.match(/&:hover/)) // Do we need to track the mouse
      }, [cssString.current])

      const finalStyle = React.useRef<Style>({ ...rnStyle })
      // Read all the data we might need
      const { onMouseEnter, onMouseLeave, style: hoverStyle } = useHover(rnStyle, props.onMouseEnter, props.onMouseLeave)
      if (needsHover) {
        finalStyle.current = hoverStyle
      }
      const { em } = useFontSize(finalStyle.current.fontSize, units.current.rem)
      if (needsFontSize) {
        if (units.current.em !== em) units.current = { ...units.current, em }
        if (rnStyle.fontSize) finalStyle.current.fontSize = em + 'px'
      }
      const { width, height, onLayout } = useLayout(needsLayout, props.onLayout)
      if (needsLayout && (units.current.width !== width || units.current.height !== height)) {
        units.current = { ...units.current, width, height }
      }
      const { vw, vh, vmin, vmax } = useScreenSize()
      if (needsScreenSize && (units.current.vw !== vw || units.current.vh !== vh || units.current.vmin !== vmin || units.current.vmax !== vmax)) {
        units.current = { ...units.current, vw, vh, vmin, vmax }
      }

      let style = React.useMemo(() => convertStyle(props.style, finalStyle.current, units.current), [props.style, finalStyle.current, units.current])
      style = [style, { zIndex: useZIndex(StyleSheet.flatten(style).zIndex) }]
      const newProps = { style, onMouseEnter, onMouseLeave, onLayout }
      if (em !== 16) {
        return <FontSizeContext.Provider value={em}>
          <Component ref={ref} {...props} {...newProps} />
        </FontSizeContext.Provider>
      } else {
        return <Component ref={ref} {...props} {...newProps} />
      }
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

export default styled
