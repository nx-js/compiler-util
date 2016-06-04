'use strict'

const sandboxProxies = new WeakMap()
let currentAllowedGlobals

module.exports = {
  compileCode,
  compileExpression
}

function compileExpression (src) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  return compileCode(`return ${src}`)
}

function compileCode (src) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }

  const code = new Function('sandbox', `with (sandbox) {${src}}`) // eslint-disable-line

  return function (sandbox, allowedGlobals) {
    if (typeof sandbox !== 'object') {
      throw new TypeError('first argument must be an object')
    }
    if (allowedGlobals !== undefined && allowedGlobals !== true && !Array.isArray(allowedGlobals)) {
      throw new TypeError('second argument must be an array of strings or true or undefined')
    }

    if (!sandboxProxies.has(sandbox)) {
      sandboxProxies.set(sandbox, new Proxy(sandbox, {has, get}))
    }
    currentAllowedGlobals = allowedGlobals

    let result
    try {
      result = code(sandboxProxies.get(sandbox))
    } finally {
      currentAllowedGlobals = undefined
    }
    return result
  }
}

function get (target, key, receiver) {
  if (key === Symbol.unscopables) {
    return undefined
  }
  return Reflect.get(target, key, receiver)
}

function has (target, key) {
  if (isAllowedGlobal(key)) {
    return Reflect.has(target, key)
  }
  return true
}

function isAllowedGlobal (key) {
  if (currentAllowedGlobals === true) {
    return true
  }
  if (Array.isArray(currentAllowedGlobals) && currentAllowedGlobals.indexOf(key) !== -1) {
    return true
  }
}
