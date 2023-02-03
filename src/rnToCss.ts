import { TextStyle, ViewStyle } from 'react-native'

const rnToCSS = (rn: Partial<ViewStyle & TextStyle>) =>
  Object.entries(rn)
    .map(([key, value]) => `${camelToKebab(key)}: ${convertValue(value)};`)
    .join('\n')

const camelToKebab = (str: string) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
const convertValue = (value: unknown) => isNaN(value as number) ? value : (value + 'px')

export default rnToCSS
