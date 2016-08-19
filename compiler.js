'use strict'

let secured = false
let exposedGlobals = []

module.exports = {
  compileCode,
  compileExpression,
  secure
}

function compileExpression (src, sandbox) {
  return compileCode(`return ${src}`, sandbox)
}

function compileCode (src, sandbox) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  if (typeof sandbox !== 'object') {
    throw new TypeError('second argument must be an object')
  }

  if (secured) {
    sandbox = new Proxy(sandbox, {get, has})
  }

  // test for string manipulation
  new Function(`'use strict'; ${src}`) // eslint-disable-line

  return new Function(`with (this) { return (() => { 'use strict'; ${src} }) }`) // eslint-disable-line
    .call(sandbox)
}

function get (target, key, receiver) {
  if (key === Symbol.unscopables) {
    return undefined
  }
  return Reflect.get(target, key, receiver)
}

function has (target, key) {
  if (exposedGlobals.indexOf(key) !== -1) {
    return Reflect.has(target, key)
  }
  return true
}

function secure () {
  if (secured) {
    throw new Error('the compiler is already secured')
  }

  exposedGlobals.push(...arguments)
  const globalObject = getGlobalObject()
  for (let exposed of exposedGlobals) {
    deepFreeze(globalObject[exposed])
  }

  const literals = ['', 0, true, /a/, [], {}, () => {}]
  for (let literal of literals) {
    deepFreeze(Object.getPrototypeOf(literal))
  }
  secured = true
}

function deepFreeze (obj) {
  if ((typeof obj === 'object' || typeof obj === 'function') && obj !== null && !Object.isFrozen(obj)) {
    Object.freeze(obj)
    Object.freeze(obj.constructor)
    deepFreeze(Object.getPrototypeOf(obj))
  }
}

function getGlobalObject () {
  if (typeof global === 'object' && global.global === global) return global
  if (typeof self === 'object' && self.self === self) return self // eslint-disable-line
  if (typeof window === 'object' && window.window === window) return window
  throw new Error('global object could not be detected')
}
