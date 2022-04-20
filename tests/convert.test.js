import { Dimensions } from 'react-native'
import convert, { cssToRNStyle } from '../src/cssToRN'

describe('CSS style conversion', () => {
  it('should transform basic values', () => {
    expect(convert('width: 10')).toEqual({ width: '10' })
    expect(convert('margin-top: 10')).toEqual({ marginTop: '10' })
  })
  it('should transform calc values', () => {
    expect(convert('width: calc( 100% - 10px )')).toEqual({ width: 'calc(100%-10px)' })
    expect(convert('margin-top: calc(10 - 10)')).toEqual({ marginTop: 'calc(10-10)' })
  })
  it('should handle trailing ;', () => {
    expect(convert('width: 10;')).toEqual({ width: '10' })
  })
  it('should transform composite props', () => {
    expect(convert('background: none rgb(255, 255, 255)')).toEqual({ backgroundColor: 'rgb(255,255,255)' })
    expect(convert('outline: 1px solid black')).toEqual({ outlineWidth: '1px', outlineStyle: 'solid', outlineColor: 'black' })
    expect(convert('border: 1px solid black')).toEqual({ borderWidth: '1px', borderStyle: 'solid', borderColor: 'black' })
    expect(convert('borderTop: 1px solid black')).toEqual({ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'black' })
    expect(convert('borderWidth: 2px 3% 4rem')).toEqual({ borderTopWidth: '2px', borderBottomWidth: '4rem', borderLeftWidth: '3%', borderRightWidth: '3%' })
    expect(convert('border-radius: 1px')).toEqual({ borderTopLeftRadius: '1px', borderTopRightRadius: '1px', borderBottomLeftRadius: '1px', borderBottomRightRadius: '1px' })
    expect(convert('padding: 1px')).toEqual({ paddingTop: '1px', paddingBottom: '1px', paddingLeft: '1px', paddingRight: '1px' })
    expect(convert('padding: 1px 2px 3px 4px')).toEqual({ paddingTop: '1px', paddingRight: '2px', paddingBottom: '3px', paddingLeft: '4px' })
    expect(convert('margin: 1px 2px')).toEqual({ marginTop: '1px', marginBottom: '1px', marginLeft: '2px', marginRight: '2px' })
    expect(convert('font: bold italic 1.2em "Rounded Mplus 1c", serif;')).toEqual({ fontWeight: 'bold', fontStyle: 'italic', fontSize: '1.2em', fontFamily: '"Rounded Mplus 1c", serif' })
    expect(convert('box-shadow: 2px 3px 4px rgba(0, 0, 0, 0.5)')).toEqual({ shadowOffset: { width: '2px', height: '3px' }, shadowRadius: '4px', shadowColor: 'rgba(0,0,0,0.5)' })
    expect(convert('text-shadow: 2vmin 3vmax 4vw blue')).toEqual({ textShadowOffset: { width: '2vmin', height: '3vmax' }, textShadowRadius: '4vw', textShadowColor: 'blue' })
    expect(convert('transform: translate(2px, 3px)')).toEqual({ transform: [{ translateX: '2px' }, { translateY: '3px' }] })
    expect(convert('transform: rotate3d(2px, 3px, 26deg)')).toEqual({ transform: [{ rotateX: '2px' }, { rotateY: '3px' }, { rotateZ: '26deg' }] })
    expect(convert('text-decoration: underline line-through')).toEqual({ textDecorationLine: 'underline line-through', textDecorationStyle: 'solid', textDecorationColor: 'black' })
    expect(convert('flex: 1 1 100%')).toEqual({ flexGrow: '1', flexShrink: '1', flexBasis: '100%' })
    expect(convert('flex-flow: row-reverse wrap')).toEqual({ flexDirection: 'row-reverse', flexWrap: 'wrap' })
    expect(convert('place-content: space-around space-between')).toEqual({ alignContent: 'space-around', justifyContent: 'space-between' })
  })
  it('should merge props', () => {
    expect(convert('width: 10px; flex: 1;')).toEqual({ width: '10px', flexGrow: '1', flexShrink: '0', flexBasis: '0' })
  })
  it('should apply single transform value to both x and y', () => {
    expect(convert('transform: translate(2px)')).toEqual({ transform: [{ translateX: '2px' }, { translateY: '2px' }] })
    expect(convert('transform: scale(2)')).toEqual({ transform: [{ scaleX: '2' }, { scaleY: '2' }] })
  })
  it('should read colors', () => {
    expect(convert('background-color: #236AFF; color: #8030D0;')).toEqual({ backgroundColor: '#236AFF', color: '#8030D0' })
  })
  it('should alias background to backgroundColor', () => {
    expect(convert('background: #236AFF;')).toEqual({ backgroundColor: '#236AFF' })
  })
})

describe('CSS to RN style conversion', () => {
  it('should transform basic values', () => {
    expect(cssToRNStyle('width: 10')).toEqual({ width: 10 })
    expect(cssToRNStyle('margin-top: 10')).toEqual({ marginTop: 10 })
  })
  it('should transform calc values', () => {
    expect(cssToRNStyle('width: calc( 100% - 10px )', { width: 100, height: 100 })).toEqual({ width: 90 })
    expect(cssToRNStyle('margin-top: calc(10 - 10)')).toEqual({ marginTop: 0 })
  })
  it('should handle trailing ;', () => {
    expect(cssToRNStyle('width: 10;')).toEqual({ width: 10 })
  })
  it('should transform composite props', () => {
    const { width, height } = Dimensions.get('window')
    expect(cssToRNStyle('border: 1px solid black')).toEqual({ borderWidth: 1, borderStyle: 'solid', borderColor: 'black' })
    expect(cssToRNStyle('borderTop: 1px solid black')).toEqual({ borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: 'black' })
    expect(cssToRNStyle('borderWidth: 2px 3em 4rem', { width: 100, height: 100 })).toEqual({ borderTopWidth: 2, borderBottomWidth: 64, borderLeftWidth: 48, borderRightWidth: 48 })
    expect(cssToRNStyle('border-radius: 1px')).toEqual({ borderTopLeftRadius: 1, borderTopRightRadius: 1, borderBottomLeftRadius: 1, borderBottomRightRadius: 1 })
    expect(cssToRNStyle('padding: 1px')).toEqual({ paddingTop: 1, paddingBottom: 1, paddingLeft: 1, paddingRight: 1 })
    expect(cssToRNStyle('padding: 1px 2px 3px 4px')).toEqual({ paddingTop: 1, paddingRight: 2, paddingBottom: 3, paddingLeft: 4 })
    expect(cssToRNStyle('margin: 1px 2px 3%', { width: 100, height: 100 })).toEqual({ marginTop: 1, marginBottom: 3, marginLeft: 2, marginRight: 2 })
    expect(cssToRNStyle('font: bold italic 1.2em "Rounded Mplus 1c", serif;')).toEqual({ fontWeight: 'bold', fontStyle: 'italic', fontSize: 19.2, fontFamily: '"Rounded Mplus 1c", serif' })
    expect(cssToRNStyle('box-shadow: 2px 3px 4px rgba(0, 0, 0, 0.5)')).toEqual({ shadowOffset: { width: 2, height: 3 }, shadowRadius: 4, shadowColor: 'rgba(0,0,0,0.5)' })
    expect(cssToRNStyle('text-shadow: 200vmin 300vmax 400vw blue')).toEqual({ textShadowOffset: { width: 200 * Math.min(width, height) / 100, height: 300 * Math.max(width, height) / 100 }, textShadowRadius: 400 * width / 100, textShadowColor: 'blue' })
    expect(cssToRNStyle('transform: translate(2px, 3px)')).toEqual({ transform: [{ translateX: 2 }, { translateY: 3 }] })
    expect(cssToRNStyle('transform: rotate3d(2px, 3px, 26deg)')).toEqual({ transform: [{ rotateX: 2 }, { rotateY: 3 }, { rotateZ: '26deg' }] })
    expect(cssToRNStyle('text-decoration: underline line-through')).toEqual({ textDecorationLine: 'underline line-through', textDecorationStyle: 'solid', textDecorationColor: 'black' })
    expect(cssToRNStyle('flex: 1 1 100%')).toEqual({ flexGrow: 1, flexShrink: 1, flexBasis: '100%' })
    expect(cssToRNStyle('flex-flow: row-reverse wrap')).toEqual({ flexDirection: 'row-reverse', flexWrap: 'wrap' })
    expect(cssToRNStyle('place-content: space-around space-between')).toEqual({ alignContent: 'space-around', justifyContent: 'space-between' })
  })
  it('should merge props', () => {
    expect(cssToRNStyle('width: 10px; flex: 1;')).toEqual({ width: 10, flexGrow: 1, flexShrink: 0, flexBasis: 0 })
  })
  it('should apply single transform value to both x and y', () => {
    expect(cssToRNStyle('transform: translate(2px)')).toEqual({ transform: [{ translateX: 2 }, { translateY: 2 }] })
    expect(cssToRNStyle('transform: scale(2)')).toEqual({ transform: [{ scaleX: 2 }, { scaleY: 2 }] })
  })
  it('should read colors', () => {
    expect(cssToRNStyle('background-color: #236AFF; color: #8030D0;')).toEqual({ backgroundColor: '#236AFF', color: '#8030D0' })
  })
  it('should alias background to backgroundColor', () => {
    expect(cssToRNStyle('background: #236AFF;')).toEqual({ backgroundColor: '#236AFF' })
  })
  it('should accept base64 urls', () => {
    expect(cssToRNStyle("cursor: url('data:image/x-icon;base64,/35///58P//8eB///HAP//xgB//8QAP//AAD//wAB//8AA///gAf//8AP///wD////C////5v///+7////x///w=='), auto")).toEqual({ cursor: "url('data:image/x-icon;base64,/35///58P//8eB///HAP//xgB//8QAP//AAD//wAB//8AA///gAf//8AP///wD////C////5v///+7////x///w=='), auto" })
  })
})
