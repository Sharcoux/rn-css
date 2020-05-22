import calculation from '../src/cssToRN/calc'

describe('string calculation', () => {
  it('should handle basic operations', () => {
    expect(calculation('1+2')).toBe(3)
    expect(calculation('3*2')).toBe(6)
    expect(calculation('3-2')).toBe(1)
    expect(calculation('10/2')).toBe(5)
  })
  it('should handle negative values', () => {
    expect(calculation('-1+2')).toBe(1)
    expect(calculation('1+-2')).toBe(-1)
  })
  it('should handle priority order', () => {
    expect(calculation('2/2*5')).toBe(5)
    expect(calculation('2/(2*5)')).toBe(0.2)
    expect(calculation('10-5-2')).toBe(3)
    expect(calculation('10-(5-2)')).toBe(7)
  })
})
