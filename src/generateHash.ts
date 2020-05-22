export default (value: string) => {
  let h = 0
  for (let i = 0; i < value.length; i++) h = Math.imul(31, h) + value.charCodeAt(i) | 0
  return h.toString(36)
}
