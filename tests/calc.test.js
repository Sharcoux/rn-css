import { calculate } from '../src/cssToRN/maths'

describe('string calculation', () => {
  it('should handle basic operations', () => {
    expect(calculate('1+2')).toBe(3)
    expect(calculate('3*2')).toBe(6)
    expect(calculate('3-2')).toBe(1)
    expect(calculate('10/2')).toBe(5)
  })
  it('should handle negative values', () => {
    expect(calculate('-1+2')).toBe(1)
    expect(calculate('1+-2')).toBe(-1)
  })
  it('should handle priority order', () => {
    expect(calculate('2/2*5')).toBe(5)
    expect(calculate('2/(2*5)')).toBe(0.2)
    expect(calculate('10-5-2')).toBe(3)
    expect(calculate('10-(5-2)')).toBe(7)
  })
})
