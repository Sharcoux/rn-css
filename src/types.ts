import { ViewStyle, TextStyle, ImageStyle } from 'react-native'

export type Units = {
  '%'?: number;
  vw?: number;
  vh?: number;
  vmin?: number;
  vmax?: number;
  em: number;
  rem: number;
  px: number;
  pt: number;
  pc: number;
  in: number;
  cm: number;
  mm: number;
  width?: number;
  height?: number;
}

export type Context = {
  type: 'all' | 'sprint' | 'speech' | 'screen'
  width: number
  height: number
  aspectRatio: number
  orientation: 'portrait' | 'landscape'
  resolution: number
  scan: 'interlace' | 'progressive'
  grid: 0 | 1
  update: 'none' | 'slow' | 'fast'
  overflowBlock: 'none' | 'scroll' | 'paged'
  overflowInline: 'none' | 'scroll'
  environmentBlending: 'opaque' | 'additive' | 'subtractive'
  color: number
  colorGamut: 'srgb' | 'p3' | 'rec2020'
  colorIndex: number
  dynamicRange: 'standard' | 'high'
  monochrome: number
  invertedColors: 'none' | 'inverted'
  pointer: 'none' | 'coarse' | 'fine'
  hover: 'none' | 'hover'
  anyPointer: 'none' | 'coarse' | 'fine'
  anyHover: 'none' | 'hover'
  prefersReducedMotion: 'no-preference' | 'reduce'
  prefersReducedTransparency: 'no-preference' | 'reduce'
  prefersReducedData: 'no-preference' | 'reduce'
  prefersContrast: 'no-preference' | 'high' | 'low' | 'forced'
  prefersColorScheme: 'light' | 'dark'
  forcedColor: 'none' | 'active'
  scripting: 'none' | 'initial-only' | 'enabled'
  deviceWidth: number
  deviceHeight: number
  deviceAspectRatio: number
  units: Units
}

export type AnyStyle = ViewStyle | TextStyle | ImageStyle

export type CompleteStyle = ViewStyle & TextStyle & ImageStyle

export type PartialStyle = Partial<Record<keyof CompleteStyle, string>> & {
  shadowOffset?: {
    width: string;
    height: string;
  };
  textShadowOffset?: {
    width: string;
    height: string;
  };
  textOverflow?: 'ellipsis'
  transform?: Transform[];
}

export type Style = PartialStyle & {
  hover?: PartialStyle;
  active?: PartialStyle;
  media?: MediaQuery[];
}

export type MediaQuery = (context: Context) => false | PartialStyle

export type Transform = {
  scaleX?: string;
  scaleY?: string;
  translateX?: string;
  translateY?: string;
  skewX?: string;
  skewY?: string;
  perspective?: string;
  rotateX?: string;
  rotateY?: string;
  rotateZ?: string;
}
