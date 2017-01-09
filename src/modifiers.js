'use strict'

const filters = new Map()
const limiters = new Map()

module.exports = {
  filters,
  limiters,
  filter,
  limiter
}

function filter (name, handler) {
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

function limiter (name, handler) {
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
