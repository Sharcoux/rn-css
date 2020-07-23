import convert from '../src/cssToRN'

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
    expect(convert('border: 1px solid black')).toEqual({ borderWidth: '1px', borderStyle: 'solid', borderColor: 'black' })
    expect(convert('borderTop: 1px solid black')).toEqual({ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'black' })
    expect(convert('borderWidth: 2px 3% 4rem')).toEqual({ borderTopWidth: '2px', borderBottomWidth: '4rem', borderLeftWidth: '3%', borderRightWidth: '3%' })
    expect(convert('border-radius: 1px')).toEqual({ borderTopLeftRadius: '1px', borderTopRightRadius: '1px', borderBottomLeftRadius: '1px', borderBottomRightRadius: '1px' })
    expect(convert('padding: 1px')).toEqual({ paddingTop: '1px', paddingBottom: '1px', paddingLeft: '1px', paddingRight: '1px' })
    expect(convert('padding: 1px 2px 3px 4px')).toEqual({ paddingTop: '1px', paddingRight: '2px', paddingBottom: '3px', paddingLeft: '4px' })
    expect(convert('margin: 1px 2px')).toEqual({ marginTop: '1px', marginBottom: '1px', marginLeft: '2px', marginRight: '2px' })
    expect(convert('font: bold italic 1.2em "Fira Sans", serif;')).toEqual({ fontWeight: 'bold', fontStyle: 'italic', fontSize: '1.2em', fontFamily: '"Fira Sans", serif' })
    expect(convert('box-shadow: 2px 3px 4px blue')).toEqual({ shadowOffset: { width: '2px', height: '3px' }, shadowRadius: '4px', shadowColor: 'blue' })
    expect(convert('text-shadow: 2vmin 3vmax 4vw blue')).toEqual({ textShadowOffset: { width: '2vmin', height: '3vmax' }, textShadowRadius: '4vw', textShadowColor: 'blue' })
    expect(convert('transform: translate(2px, 3px)')).toEqual({ transform: [{ translateX: '2px', translateY: '3px' }] })
    expect(convert('transform: rotate3d(2px, 3px, 26deg)')).toEqual({ transform: [{ rotateX: '2px', rotateY: '3px', rotateZ: '26deg' }] })
    expect(convert('text-decoration: underline line-through')).toEqual({ textDecorationLine: 'underline line-through', textDecorationStyle: 'solid', textDecorationColor: 'black' })
    expect(convert('flex: 1 1 100%')).toEqual({ flexGrow: '1', flexShrink: '1', flexBasis: '100%' })
  })
  it('should merge props', () => {
    expect(convert('width: 10px; flex: 1;')).toEqual({ width: '10px', flexGrow: '1', flexShrink: '0', flexBasis: '0' })
  })
  it('should read colors', () => {
    expect(convert('background-color: #236AFF; color: #8030D0;')).toEqual({ backgroundColor: '#236AFF', color: '#8030D0' })
  })
})
