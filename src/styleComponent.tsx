/* eslint-disable react/display-name */
import React, { MouseEvent } from 'react'
import type { StyleMap, Style, Units } from './types'
import cssToStyle from './cssToRN'
import calculHash from './generateHash'
import { useLayout, useScreenSize, useFontSize, useHover, FontSizeContext, useZIndex } from './features'
import convertStyle from './convertStyle'
import { LayoutChangeEvent, StyleProp, StyleSheet, FlatList, FlatListProps, SectionList, SectionListProps, VirtualizedList, VirtualizedListProps } from 'react-native'

// We use this to cache the computed styles
const styleMap: StyleMap = {}

type Primitive = number | string | null | undefined | boolean
type Functs<T> = (arg: T & { rnCSS?: string}) => Primitive
type OptionalProps = {
  rnCSS?: string;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onLayout?: (event: LayoutChangeEvent) => void
  children?: React.ReactNode;
  style?: StyleProp<any>;
}
function buildCSSString<T extends { rnCSS?: string }> (chunks: TemplateStringsArray, functs: (Primitive | Functs<T>)[], props: T) {
  let computedString = chunks.map((chunk, i) => ([chunk, (functs[i] instanceof Function) ? (functs[i] as Functs<T>)(props) : functs[i]])).flat().join('')
  if (props.rnCSS) computedString += props.rnCSS.replace(/=/gm, ':') + ';'
  return computedString
}
const styled = <Props, >(Component: React.ComponentType<Props>) => {
  const styledComponent = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & Props>)[]) => {
    const ForwardRefComponent = React.forwardRef<React.ComponentType<S & Props & OptionalProps>, S & Props & OptionalProps>((props: S & Props & OptionalProps, ref) => {
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
        }
        else {
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

      // const [needsFontSize, setNeedsFontSize] = React.useState(false)
      const [needsScreenSize, setNeedsScreenSize] = React.useState(false)
      const [needsLayout, setNeedsLayout] = React.useState(false)
      // const [needsHover, setNeedsHover] = React.useState(false)
      React.useEffect(() => {
        const css = cssString.current
        // setNeedsFontSize(!!css.match(/\b(\d+)(\.\d+)?em\b/)) // Do we need em units
        setNeedsScreenSize(!!css.match(/\b(\d+)(\.\d+)?v([hw]|min|max)\b/)) // Do we need vx units
        setNeedsLayout(!!css.match(/\d%/)) // Do we need % units
        // setNeedsHover(!!css.match(/&:hover/)) // Do we need to track the mouse
      }, [cssString.current])

      const finalStyle = React.useRef<Style>({ ...rnStyle })
      // Read all the data we might need

      // Handle hover
      const { onMouseEnter, onMouseLeave, style: hoverStyle } = useHover(rnStyle, props.onMouseEnter, props.onMouseLeave)
      finalStyle.current = hoverStyle

      // Handle em units
      const { em } = useFontSize(finalStyle.current.fontSize, units.current.rem)
      if (units.current.em !== em) units.current = { ...units.current, em }
      if (finalStyle.current.fontSize) finalStyle.current.fontSize = em + 'px'

      // Handle layout data needed for % units
      const { width, height, onLayout } = useLayout(props.onLayout)
      if (needsLayout && (units.current.width !== width || units.current.height !== height)) {
        units.current = { ...units.current, width, height }
      }

      // Handle screen size needed for vw and wh units
      const { vw, vh, vmin, vmax } = useScreenSize()
      if (needsScreenSize && (units.current.vw !== vw || units.current.vh !== vh || units.current.vmin !== vmin || units.current.vmax !== vmax)) {
        units.current = { ...units.current, vw, vh, vmin, vmax }
      }

      const styleConvertedFromCSS = React.useMemo(() => convertStyle(props.style, finalStyle.current, units.current), [props.style, finalStyle.current, units.current])
      const zIndex = useZIndex(StyleSheet.flatten(styleConvertedFromCSS).zIndex)
      const style: StyleProp<any> = React.useMemo(() => (zIndex ? [styleConvertedFromCSS, zIndex] : styleConvertedFromCSS), [styleConvertedFromCSS, zIndex])
      const newProps = { style, onMouseEnter, onMouseLeave, onLayout }

      const currentFontSize = React.useContext(FontSizeContext)
      if (em !== currentFontSize) {
        return <FontSizeContext.Provider value={em}>
          <Component ref={ref} {...props} {...newProps} />
        </FontSizeContext.Provider>
      }
      else {
        return <Component ref={ref} {...props} {...newProps} />
      }
    })
    return ForwardRefComponent as React.ForwardRefExoticComponent<Props & S & OptionalProps & { ref?: React.Ref<any> }>
  }

  // provide withStyle(Comp).attrs({} | () => {}) feature
  styledComponent.attrs = <S, >(opts: Partial<S & Props> | ((props: S & Props) => Partial<S & Props>)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & Props>)[]) => {
    const ForwardRefComponent = React.forwardRef<typeof Component, S & Props>((props: Props & S, ref) => {
      const attrs = (opts instanceof Function) ? opts(props) : opts
      const ComponentWithAttrs = styledComponent(chunks, ...functs)
      return <ComponentWithAttrs ref={ref} {...props} {...attrs} />
    })
    return ForwardRefComponent as React.ForwardRefExoticComponent<(Props | S) & OptionalProps & { ref?: React.Ref<any> }>
  }

  return styledComponent
}

export default styled

export const styledFlatList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S>)[]) => <Type, >(props: S & FlatListProps<Type> & OptionalProps) => invoke(styled<FlatListProps<Type>>(FlatList)(chunks, ...functs), props)
styledFlatList.attrs = <S, >(opts: Partial<S & FlatListProps<any>> | ((props: S & FlatListProps<any>) => Partial<S & FlatListProps<any>>)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & FlatListProps<any>>)[]) => <Props, >(componentProps: S & FlatListProps<Props> & OptionalProps) => invoke(styled<FlatListProps<Props>>(FlatList).attrs<S>(opts)(chunks, ...functs), componentProps)
export const styledSectionList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S>)[]) => <Type, >(props: S & SectionListProps<Type> & OptionalProps) => invoke(styled<SectionListProps<Type>>(SectionList)(chunks, ...functs), props)
styledSectionList.attrs = <S, >(opts: Partial<S & SectionListProps<any>> | ((props: S & SectionListProps<any>) => Partial<S & SectionListProps<any>>)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & SectionListProps<any>>)[]) => <Props, >(componentProps: S & SectionListProps<Props> & OptionalProps) => invoke(styled<SectionListProps<any>>(SectionList).attrs(opts)(chunks, ...functs), componentProps)
export const styledVirtualizedList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S>)[]) => <Type, >(props: S & VirtualizedListProps<Type> & OptionalProps) => invoke(styled<VirtualizedListProps<Type>>(VirtualizedList)(chunks, ...functs), props)
styledVirtualizedList.attrs = <S, >(opts: Partial<S & VirtualizedListProps<any>> | ((props: S & VirtualizedListProps<any>) => Partial<S & VirtualizedListProps<any>>)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & VirtualizedListProps<any>>)[]) => <Props, >(componentProps: S & VirtualizedListProps<Props> & OptionalProps) => invoke(styled<VirtualizedListProps<Props>>(VirtualizedList).attrs(opts)(chunks, ...functs), componentProps)

function invoke<T> (Component: React.ComponentType<T>, props: T) {
  return <Component {...props} />
}
