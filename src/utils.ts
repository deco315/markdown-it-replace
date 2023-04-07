export function createScope() {
  let inside = false

  return {
    scope(fn: () => any) {
      inside = true
      fn()
      inside = false
    },

    insideScope() {
      return inside
    }
  }
}
