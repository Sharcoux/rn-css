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
  width?: number;
  height?: number;
}

export type Style = {
  [key: string]: string;
} & {
  transform?: Transform[];
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
