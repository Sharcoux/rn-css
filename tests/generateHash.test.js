import hash from '../src/generateHash'

it('should give the same hash for any value', () => {
  for (let i = 0; i < 10; i++) {
    const value = parseInt(Math.random() * 10000000, 10)
    expect(hash(value)).toBe(hash(value))
  }
})
