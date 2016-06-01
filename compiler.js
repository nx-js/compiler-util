'use strict'

const proxies = new WeakMap()
let ALLOWED_GLOBALS

module.exports = {
  compileCode,
  compileExpression
}

function has (target, key) {
  if (isAllowedGlobal(key)) return Reflect.has(target, key)
  else return true
}

function isAllowedGlobal (key) {
  if (ALLOWED_GLOBALS === true) return true
  if (Array.isArray(ALLOWED_GLOBALS) && ALLOWED_GLOBALS.indexOf(key) !== -1) return true
}

function get (target, key, receiver) {
  if (key === Symbol.unscopables) return undefined
  return Reflect.get(target, key, receiver)
}

function compileCode (src) {
  if (typeof src !== 'string') throw new TypeError('first argument must be a string')

  const code = new Function('ctx', `with (ctx) {${src}}`)

  return function (ctx, allowed) {
    if (typeof ctx !== 'object') throw new TypeError('first argument must be an object')
    if (allowed !== undefined && allowed !== true && !Array.isArray(allowed)) {
      throw new TypeError('second argument must be undefined, true, or an array of strings')
    }

    if (!proxies.has(ctx)) proxies.set(ctx, new Proxy(ctx, {has, get}))
    ALLOWED_GLOBALS = allowed
    let result
    try {
      result = code(proxies.get(ctx))
    } finally {
      ALLOWED_GLOBALS = undefined
      return result
    }
  }
}

function compileExpression (src) {
  return compileCode(`return ${src}`)
}
