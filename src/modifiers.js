export const filters = new Map()
export const limiters = new Map()

export function filter (name, handler) {
  if (typeof name !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  if (typeof handler !== 'function') {
    throw new TypeError('Second argument must be a function.')
  }
  if (filters.has(name)) {
    throw new Error(`A filter named ${name} is already registered.`)
  }
  filters.set(name, handler)
  return this
}

export function limiter (name, handler) {
  if (typeof name !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  if (typeof handler !== 'function') {
    throw new TypeError('Second argument must be a function.')
  }
  if (limiters.has(name)) {
    throw new Error(`A limiter named ${name} is already registered.`)
  }
  limiters.set(name, handler)
  return this
}
