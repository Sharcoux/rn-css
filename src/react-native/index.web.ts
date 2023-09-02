// We use those fallbacks to make cssToRN not depend on react-native

export const Platform = {
  OS: 'web'
}

export const Dimensions = {
  get: (dimension: 'width' | 'height') => dimension === 'width' ? window.innerWidth : window.innerHeight
}

export const PixelRatio = {
  getPixelSizeForLayoutSize: (dp: number) => dp * window.devicePixelRatio
}
