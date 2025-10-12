module.exports = function mock (moduleRef, factoryRef) {
  const deref = (ref) => String(ref).substring(2)
  if (factoryRef === undefined) {
    jest.mock(deref(moduleRef))
  }
  else {
    const mockFactory = deref(factoryRef)
    jest.mock(deref(moduleRef), () => jest.requireActual(mockFactory))
  }
}
