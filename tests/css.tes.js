import cssToStyle from '../cssToRN'

describe('css to react native style', () => {
  it('should handle calc', () => {
    const style = cssToStyle('margin-left: calc( 100px + 10em )', { em: 12, px: 1 })
    expect(style.marginLeft).toBe(220)
  })
})
