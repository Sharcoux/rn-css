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

export type MediaQuery = (context: Context) => false | Style

export type Style = {
  [key: string]: string;
} & {
  shadowOffset?: {
    width: string;
    height: string;
  };
  transform?: Transform[];
  hover?: Style;
  media?: MediaQuery[];
}

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

export type StyleMap = {
  [key: string]: {
    usages: number;
    style: Style;
  };
}
