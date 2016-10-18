'use strict'

module.exports = {
  compileCode,
  compileExpression
}

function compileExpression (src, sandbox) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  if (typeof sandbox !== 'object') {
    throw new TypeError('second argument must be an object')
  }

  sandbox = new Proxy(sandbox, {get, has})
  const expression = `
  try { with (sandbox) { return ${src} } } catch (err) {
    if (!(err instanceof ReferenceError || err instanceof TypeError)) throw err
  }`
  return new Function('sandbox', expression).bind(sandbox, sandbox) // eslint-disable-line
}

function compileCode (src, sandbox) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  if (typeof sandbox !== 'object') {
    throw new TypeError('second argument must be an object')
  }

  sandbox = new Proxy(sandbox, {get, has})
  return new Function('sandbox', `with (sandbox) { ${src} }`).bind(sandbox, sandbox) // eslint-disable-line
}

function get (target, key, receiver) {
  if (key === Symbol.unscopables) {
    return undefined
  }
  return Reflect.get(target, key, receiver)
}

function has (target, key) {
  return true
}
