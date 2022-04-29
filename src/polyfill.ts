/** polyfill for Node < 12 */
// eslint-disable-next-line no-extend-native
if (!Array.prototype.flat) Array.prototype.flat = function <A, D extends number = 1> (depth?: number) { return flat<A, D>(this as unknown as A, depth) }
// eslint-disable-next-line no-extend-native
if (!String.prototype.matchAll) String.prototype.matchAll = function (regex: RegExp) { return matchAll(this as unknown as string, regex) }

/** polyfill for Node < 12 */
function flat <A, D extends number = 1> (array: A, depth = 1): FlatArray<A, D>[] {
  if (!depth || depth < 1 || !Array.isArray(array)) return array as unknown as FlatArray<A, D>[]
  return array.reduce((result, current) => result.concat(flat(current as unknown as unknown[], depth - 1)),
    []
  ) as FlatArray<A, D>[]
}

function matchAll (str: string, regex: RegExp): IterableIterator<RegExpMatchArray> {
  const matches = []
  let groups
  // eslint-disable-next-line no-cond-assign
  while (groups = regex.exec(str)) {
    matches.push(groups)
  }
  return matches[Symbol.iterator]()
}
