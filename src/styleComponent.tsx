/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react/prop-types */
/* eslint-disable react/display-name */
import React, { MouseEvent } from 'react'
import { FlatList, FlatListProps, Platform, PressableProps, SectionList, SectionListProps, StyleProp, StyleSheet, TouchableHighlightProps, ViewProps, VirtualizedList, VirtualizedListProps } from 'react-native'
import convertStyle from './convertStyle'
import cssToStyle from './cssToRN'
import { useFontSize, useHover, useLayout, useScreenSize, useMediaQuery, useActive, useFocus, FocusEventListener, BlurEventListener } from './features'
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

/** `T & U`, distributed over union members of T (keeps discriminants). */
type Spread<T, U> = T extends unknown ? T & U : never

/** Like Omit, but a no-op when K is `never` (`Omit<T, never>` breaks excess-property checks on unions). */
type SafeOmit<T, K extends PropertyKey> = [K] extends [never] ? T : Omit<T, K>

/**
 * After `.attrs(result)`, keys in Result become optional.
 * Distributes over unions so soft/hard discriminants survive.
 * Value types come from Props/Part (not Result literals like `"black"`).
 * Keep as a top-level alias — inlining Omit in .d.ts collapses unions.
 */
type AttrsProps<Props, Part, Result> = Props extends unknown
  ? SafeOmit<Props, keyof Result> &
    Partial<Pick<Props, Extract<keyof Result, keyof Props>>> &
    SafeOmit<Part, keyof Result> &
    Partial<Pick<Part, Exclude<Extract<keyof Result, keyof Part>, keyof Props>>>
  : never

type OptionalProps = {
  rnCSS?: `${string};`;
  onFocus?: FocusEventListener;
  onBlur?: BlurEventListener;
  onPressIn?: TouchableHighlightProps['onPressIn'] | null;
  onPressOut?: TouchableHighlightProps['onPressOut'] | null;
  onResponderStart?: ViewProps['onResponderStart'] | null;
  onResponderRelease?: ViewProps['onResponderRelease'] | null;
  onStartShouldSetResponder?: ViewProps['onStartShouldSetResponder'] | null;
  onMouseEnter?: ((event: MouseEvent) => void) | null;
  onMouseLeave?: ((event: MouseEvent) => void) | null;
  onLayout?: ViewProps['onLayout'];
  children?: PressableProps['children'];
}

/** Converts the tagged template string into a css string */
function buildCSSString<T extends { rnCSS?: string }> (chunks: TemplateStringsArray, functs: (Primitive | Functs<T>)[], props: T, shared: unknown) {
  let computedString = chunks
    // Evaluate the chunks from the tagged template
    .map((chunk, i) => ([chunk, (functs[i] instanceof Function) ? (functs[i] as Functs<T>)({ shared, theme: (shared as DefaultTheme), ...props }) : functs[i]]))
    .flat()
    // Convert the objects to string if the result is not a primitive
    .map(chunk => chunk && typeof chunk === 'object' ? rnToCSS(chunk as Partial<CompleteStyle>) : chunk)
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

/** Extract style value type from a props object's style prop, if present. */
type StyleTypeFromProps<P> = P extends { style?: StyleProp<infer S> } ? S : unknown

/** Strip ref/key without Omit (Omit/PropsWithoutRef collapse soft unions). */
type NoRef<P> = P extends unknown
  ? { [K in keyof P as Exclude<K, 'ref' | 'key'>]: P[K] }
  : never

/** Props of C; peels RefAttributes from ForwardRefExoticComponent without collapsing soft unions. */
type PropsOf<C> = C extends React.ForwardRefExoticComponent<infer P>
  ? NoRef<P>
  : C extends React.ComponentType<infer P>
    ? P
    : never

const styled = <C extends React.ComponentType<any>>(Component: C) => {
  type InitialProps = PropsOf<C>
  type StyleType = StyleTypeFromProps<InitialProps>
  type Props = Spread<InitialProps, OptionalProps>
  type InferredRef = C extends React.ElementType ? React.ComponentRef<C> : unknown
  type HostRef = [InferredRef] extends [never] ? unknown : InferredRef

  const styledComponent = <S extends object = {}>(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<Spread<Props, S>>)[]) => {
    type MergedProps = Spread<Props, S>
    const ForwardRefComponent = React.forwardRef<HostRef, MergedProps>((props, ref) => {
      const rem = React.useContext(RemContext)
      const shared = React.useContext(SharedValue)
      // Build the css string with the context
      const css = React.useMemo(() => buildCSSString(chunks, functs, (props as unknown as Spread<Props, S>), shared), [props, shared])
      // Store the style in RN format
      const rnStyle = React.useMemo(() => cssToStyle(css), [css])

      const { needsLayout, needsHover, needsFocus, needsTouch } = React.useMemo(() => ({
        // needsFontSize: !!css.match(/\b(\d+)(\.\d+)?em\b/)
        // needsScreenSize: !!css.match(/\b(\d+)(\.\d*)?v([hw]|min|max)\b/) || !!rnStyle.media,
        needsLayout: !!css.match(/\d%/),
        needsHover: !!rnStyle.hover,
        needsTouch: !!rnStyle.active,
        needsFocus: !!rnStyle.focus
      }), [css, rnStyle.active, rnStyle.focus, rnStyle.hover])

      // Handle hover
      const { onMouseEnter, onMouseLeave, hover } = useHover(props.onMouseEnter, props.onMouseLeave, needsHover)
      // Handle active
      const { onPressIn, onPressOut, onStartShouldSetResponder, onResponderRelease, onResponderStart, active } = useActive(
        props.onPressIn, props.onPressOut,
        props.onResponderStart, props.onResponderRelease, props.onStartShouldSetResponder,
        needsTouch
      )
      // Handle focus
      const { onFocus, onBlur, focused } = useFocus(props.onFocus, props.onBlur, needsFocus)
      const tempStyle = React.useMemo<Style>(() => {
        const style = { ...rnStyle }
        delete style.media
        delete style.hover
        delete style.active
        delete style.focus
        if (focused) Object.assign(style, rnStyle.focus)
        if (hover) Object.assign(style, rnStyle.hover)
        if (active) Object.assign(style, rnStyle.active)
        return style
      }, [active, focused, hover, rnStyle])

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
        const newProps = {
          style: [styleConvertedFromCSS as StyleType, props.style],
          onMouseEnter,
          onMouseLeave,
          onLayout,
          onFocus,
          onBlur,
          onPressIn,
          onPressOut,
          onStartShouldSetResponder,
          onResponderStart,
          onResponderRelease
        }
        if (finalStyle.textOverflow === 'ellipsis') {
          Object.assign(newProps, { numberOfLines: 1 })
        }
        return newProps
      }, [finalStyle.textOverflow, onBlur, onFocus, onLayout, onMouseEnter, onMouseLeave, onPressIn, onPressOut, onStartShouldSetResponder, onResponderRelease, onResponderStart, props.style, styleConvertedFromCSS])

      React.useEffect(() => () => removeStyle(hash), [hash])

      // em !== parentEm alone is a bit dangerous as the component would rerender when the font size change
      // Cast: generic C + ref is not assignable to LibraryManagedAttributes under PropsOf.
      const RenderComponent = Component as React.ComponentType<any>
      if (em !== parentEm || finalStyle.fontSize !== undefined) {
        return <FontSizeContext.Provider value={em}>
          <RenderComponent ref={ref} {...props} {...newProps} />
        </FontSizeContext.Provider>
      }
      else {
        return <RenderComponent ref={ref} {...props} {...newProps} />
      }
    })
    return ForwardRefComponent as React.ForwardRefExoticComponent<MergedProps & React.RefAttributes<HostRef>>
  }

  // provide styled(Comp).attrs({} | () => {}) feature
  styledComponent.attrs = <Part extends object = {}, Result extends Partial<Spread<Props, Part>> = Partial<Spread<Props, Part>>>(opts: Result | ((props: Spread<Props, Part>) => Result)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<Spread<Props, Part>>)[]) => {
    const ComponentWithAttrs = styledComponent(chunks, ...functs)
    // Attrs on InitialProps (before OptionalProps) so Omit distributes per union branch; then Spread OptionalProps.
    type OutProps = Spread<AttrsProps<InitialProps, Part, Result>, OptionalProps>
    const ForwardRefComponent = React.forwardRef<HostRef, OutProps>((props, ref) => {
      const castProps = props as unknown as Spread<Props, Part>
      const attrs = (opts instanceof Function) ? opts(castProps) : opts
      return <ComponentWithAttrs ref={ref} {...attrs} {...castProps} />
    })
    // Keep AttrsProps/Spread by name in the cast so .d.ts preserves distributivity.
    return ForwardRefComponent as React.ForwardRefExoticComponent<
      Spread<AttrsProps<InitialProps, Part, Result>, OptionalProps> & React.RefAttributes<HostRef>
    >
  }

  return styledComponent
}

export default styled

export const styledFlatList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & FlatListProps<any> & OptionalProps>)[]) => <Type, >(props: S & OptionalProps & FlatListProps<Type>) => invoke(styled(FlatList as React.ComponentType<FlatListProps<Type>>)(chunks, ...functs), props)
styledFlatList.attrs = <S extends object = {}, Result extends Partial<S & FlatListProps<any> & OptionalProps> = {} > (opts: Result | ((props: S & OptionalProps & FlatListProps<any>) => Result)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S>)[]) => <Props, >(componentProps: AttrsProps<FlatListProps<Props> & OptionalProps, S, Result>) => invoke(styled(FlatList as React.ComponentType<FlatListProps<Props>>).attrs<S>(opts)(chunks, ...functs), componentProps as any)
export const styledSectionList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & SectionListProps<any> & OptionalProps>)[]) => <Type, >(props: S & OptionalProps & SectionListProps<Type>) => invoke(styled(SectionList as React.ComponentType<SectionListProps<Type>>)(chunks, ...functs), props)
styledSectionList.attrs = <S extends object = {}, Result extends Partial<S & SectionListProps<any> & OptionalProps> = {} >(opts: Result | ((props: S & OptionalProps & SectionListProps<any>) => Result)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S>)[]) => <Props, >(componentProps: AttrsProps<SectionListProps<Props> & OptionalProps, S, Result>) => invoke(styled(SectionList as React.ComponentType<SectionListProps<Props>>).attrs<S>(opts)(chunks, ...functs), componentProps as any)
export const styledVirtualizedList = <S, >(chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S & VirtualizedListProps<any> & OptionalProps>)[]) => <Type, >(props: S & OptionalProps & VirtualizedListProps<Type>) => invoke(styled(VirtualizedList as React.ComponentType<VirtualizedListProps<Type>>)(chunks, ...functs), props)
styledVirtualizedList.attrs = <S extends object = {}, Result extends Partial<S & VirtualizedListProps<any> & OptionalProps> = {} >(opts: Result | ((props: S & OptionalProps & VirtualizedListProps<any>) => Result)) => (chunks: TemplateStringsArray, ...functs: (Primitive | Functs<S>)[]) => <Props, >(componentProps: AttrsProps<VirtualizedListProps<Props> & OptionalProps, S, Result>) => invoke(styled(VirtualizedList as React.ComponentType<VirtualizedListProps<Props>>).attrs<S>(opts)(chunks, ...functs), componentProps as any)

function invoke<T extends object> (Component: React.ComponentType<T>, props: T) {
  return <Component {...props} />
}
