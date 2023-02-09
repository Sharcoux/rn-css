/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { MouseEvent } from 'react'
import { FlatList, FlatListProps, LayoutChangeEvent, Platform, SectionList, SectionListProps, StyleProp, StyleSheet, ViewStyle, VirtualizedList, VirtualizedListProps } from 'react-native'
import convertStyle from './convertStyle'
import cssToStyle from './cssToRN'
import { useFontSize, useHover, useLayout, useScreenSize, useMediaQuery } from './features'
import type { AnyStyle, CompleteStyle, Style, Units } from './types'
import generateHash from './generateHash'
import rnToCSS from './rnToCss'

export const defaultUnits: Units = { em: 16, vw: 1, vh: 1, vmin: 1, vmax: 1, rem: 16, px: 1, pt: 72 / 96, in: 96, pc: 9, cm: 96 / 2.54, mm: 96 / 25.4 }
export const RemContext = React.createContext<number>(defaultUnits.rem)
export const FontSizeContext = React.createContext(defaultUnits.em)

// We use this to share value within the component (Theme, Translation, whatever)
export const SharedValue = React.createContext<unknown>(undefined)

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DefaultTheme {}

type Primitive = number | string | null | undefined | boolean | CompleteStyle
type Functs<T> = (arg: T & { rnCSS?: string; shared: unknown, theme: DefaultTheme }) => Primitive
type OptionalProps = {
  rnCSS?: `${string};`;
  onMouseEnter?: (event: MouseEvent) => void;
  onMouseLeave?: (event: MouseEvent) => void;
  onLayout?: (event: LayoutChangeEvent) => void
  children?: React.ReactNode;
}

/** Converts the tagged template string into a css string */
function buildCSSString<T extends { rnCSS?: string }> (chunks: TemplateStringsArray, functs: (Primitive | Functs<T>)[], props: T, shared: unknown) {
  let computedString = chunks
    // Evaluate the chunks from the tagged template
    .map((chunk, i) => ([chunk, (functs[i] instanceof Function) ? (functs[i] as Functs<T>)({ shared, theme: (shared as DefaultTheme), ...props }) : functs[i]]))
    .flat()
    // Convert the objects to string if the result is not a primitive
    .map(chunk => typeof chunk === 'object' ? rnToCSS(chunk as Partial<CompleteStyle>) : chunk)
    .join('')
  if (props.rnCSS) computedString += props.rnCSS.replace(/=/gm, ':') + ';'
  return computedString
}

const styleMap: Record<string, { style: AnyStyle, usage: number }> = {}
function getStyle <T extends AnyStyle, > (hash: string, style: T) {
  const styleInfo = styleMap[hash]
  if (styleInfo) {
    styleInfo.usage++
    return styleInfo.style as T
  }
  else {
    const sheet = StyleSheet.create({ [hash]: style })
    return (styleMap[hash] = { style: sheet[hash], usage: 1 }).style as T
  }
}
function removeStyle (hash: string) {
  styleMap[hash].usage--
  if (styleMap[hash].usage <= 0) delete styleMap[hash]
}
const styled = <StyleType, InitialProps extends { style?: StyleProp<StyleType> }, Props extends InitialProps & OptionalProps = InitialProps & OptionalProps>(Component: React.ComponentType<InitialProps>) => {
  const styledComponent = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & Props>)[]) => {
    const ForwardRefComponent = React.forwardRef<React.ComponentType<S & Props>, S & Props>((props: S & Props, ref) => {
      const rem = React.useContext(RemContext)
      const shared = React.useContext(SharedValue)
      // Build the css string with the context
      const css = React.useMemo(() => buildCSSString(chunks, functs, props, shared), [props, shared])
      // Store the style in RN format
      const rnStyle = React.useMemo(() => cssToStyle(css), [css])

      const { needsLayout, needsHover } = React.useMemo(() => ({
        // needsFontSize: !!css.match(/\b(\d+)(\.\d+)?em\b/)
        // needsScreenSize: !!css.match(/\b(\d+)(\.\d*)?v([hw]|min|max)\b/) || !!rnStyle.media,
        needsLayout: !!css.match(/\d%/),
        needsHover: !!rnStyle.hover
      }), [css, rnStyle.hover])

      // Handle hover
      const { onMouseEnter, onMouseLeave, hover } = useHover(props.onMouseEnter, props.onMouseLeave, needsHover)
      const tempStyle = React.useMemo<Style>(() => {
        const style = { ...rnStyle }
        delete style.media
        delete style.hover
        if (hover) Object.assign(style, rnStyle.hover)
        return style
      }, [hover, rnStyle])

      // Calculate current em unit for media-queries
      const parentEm = React.useContext(FontSizeContext)
      const { em: tempEm } = useFontSize(tempStyle.fontSize, rem, parentEm)
      // Handle layout data needed for % units
      const { width, height, onLayout } = useLayout(props.onLayout, needsLayout)
      // Handle screen size needed for vw and wh units
      const screenUnits = useScreenSize()

      /** The units before re-updating the em */
      const baseUnits = React.useMemo<Units>(() => ({
        ...defaultUnits,
        rem,
        em: tempEm,
        width,
        height,
        ...screenUnits
      }), [height, rem, screenUnits, tempEm, width])

      // apply media queries
      const mediaQuery = useMediaQuery(rnStyle.media, baseUnits)
      // Handle em units
      const fontSize = (mediaQuery && mediaQuery.fontSize) || tempStyle.fontSize
      const { em } = useFontSize(fontSize, baseUnits.rem, parentEm)

      const finalStyle = React.useMemo<Style>(() => {
        const style: Style = { ...tempStyle, ...mediaQuery }
        if (style.fontSize) style.fontSize = em + 'px'
        if (style.zIndex === undefined && Platform.OS === 'web') style.zIndex = 'auto'
        return style
      }, [em, mediaQuery, tempStyle])

      const units = React.useMemo<Units>(() => ({ ...baseUnits, em }), [baseUnits, em])

      const { style: styleConvertedFromCSS, hash } = React.useMemo(() => {
        const style = convertStyle<CompleteStyle>(finalStyle, units)
        delete (style as Style).textOverflow
        const hash = generateHash(JSON.stringify(style))
        return { style: getStyle<CompleteStyle>(hash, style), hash }
      }, [finalStyle, units])
      const newProps = React.useMemo(() => {
        const newProps = { style: [styleConvertedFromCSS as StyleType, props.style], onMouseEnter, onMouseLeave, onLayout }
        if (finalStyle.textOverflow === 'ellipsis') {
          Object.assign(newProps, { numberOfLines: 1 })
        }
        return newProps
      }, [finalStyle.textOverflow, onLayout, onMouseEnter, onMouseLeave, props.style, styleConvertedFromCSS])

      React.useEffect(() => () => removeStyle(hash), [hash])

      // em !== parentEm alone is a bit dangerous as the component would rerender when the font size change
      if (em !== parentEm || finalStyle.fontSize !== undefined) {
        return <FontSizeContext.Provider value={em}>
          <Component ref={ref} {...props} {...newProps} />
        </FontSizeContext.Provider>
      }
      else {
        return <Component ref={ref} {...props} {...newProps} />
      }
    })
    return ForwardRefComponent as React.ForwardRefExoticComponent<Props & S & { ref?: React.Ref<any> }>
  }

  // provide styled(Comp).attrs({} | () => {}) feature
  styledComponent.attrs = <Part, Result extends Partial<Part & Props> = Partial<Part & Props>>(opts: Result | ((props: Part & Props) => Result)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<Part & Props>)[]) => {
    const ComponentWithAttrs = styledComponent(chunks, ...functs)
    const ForwardRefComponent = React.forwardRef<React.ComponentType<Props & Part>, Props & Part>((props, ref) => {
      const attrs = (opts instanceof Function) ? opts(props) : opts
      return <ComponentWithAttrs ref={ref} {...props} {...attrs} />
    })
    // TODO : Find a way to remove from the Props the properties affected by opts
    return ForwardRefComponent
  }

  return styledComponent
}

export default styled

export const styledFlatList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & FlatListProps<any> & OptionalProps>)[]) => <Type, >(props: S & OptionalProps & FlatListProps<Type>) => invoke(styled<ViewStyle, FlatListProps<Type>>(FlatList)(chunks, ...functs), props)
styledFlatList.attrs = <S, >(opts: S & FlatListProps<any> & OptionalProps | ((props: S & FlatListProps<any> & OptionalProps) => Partial<S & OptionalProps & FlatListProps<any>>)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & OptionalProps & FlatListProps<any>>)[]) => <Props, >(componentProps: S & OptionalProps & FlatListProps<Props>) => invoke(styled<ViewStyle, FlatListProps<Props>>(FlatList).attrs<S>(opts)(chunks, ...functs), componentProps as any)
export const styledSectionList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & SectionListProps<any> & OptionalProps>)[]) => <Type, >(props: S & OptionalProps & SectionListProps<Type>) => invoke(styled<ViewStyle, SectionListProps<Type>>(SectionList)(chunks, ...functs), props)
styledSectionList.attrs = <S, >(opts: S & SectionListProps<any> & OptionalProps | ((props: S & SectionListProps<any> & OptionalProps) => Partial<S & OptionalProps & SectionListProps<any>>)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & SectionListProps<any>>)[]) => <Props, >(componentProps: S & OptionalProps & SectionListProps<Props>) => invoke(styled<ViewStyle, SectionListProps<Props>>(SectionList).attrs<S>(opts)(chunks, ...functs), componentProps as any)
export const styledVirtualizedList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & VirtualizedListProps<any> & OptionalProps>)[]) => <Type, >(props: S & OptionalProps & VirtualizedListProps<Type>) => invoke(styled<ViewStyle, VirtualizedListProps<Type>>(VirtualizedList)(chunks, ...functs), props)
styledVirtualizedList.attrs = <S, >(opts: S & VirtualizedListProps<any> & OptionalProps | ((props: S & VirtualizedListProps<any> & OptionalProps) => Partial<S & OptionalProps & VirtualizedListProps<any>>)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & VirtualizedListProps<any>>)[]) => <Props, >(componentProps: S & OptionalProps & VirtualizedListProps<Props>) => invoke(styled<ViewStyle, VirtualizedListProps<Props>>(VirtualizedList).attrs<S>(opts)(chunks, ...functs), componentProps as any)

function invoke<T> (Component: React.ComponentType<T>, props: T) {
  return <Component {...props} />
}
