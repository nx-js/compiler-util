'use strict'

module.exports = {
  compileCode,
  compileExpression,
  sandbox
}

const expressionCache = new Map()
const codeCache = new Map()

function compileExpression (src) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  let expression = expressionCache.get(src)
  if (!expression) {
    expression = new Function('sandbox',
      `try { with (sandbox) { return ${src} } } catch (err) {
        if (!(err instanceof ReferenceError || err instanceof TypeError)) throw err
      }`)
    expressionCache.set(src, expression)
  }
  return expression // eslint-disable-line
}

function compileCode (src) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  let code = codeCache.get(src)
  if (!code) {
    code = new Function('sandbox', `with (sandbox) { ${src} }`)
    codeCache.set(src, code)
  }
  return code // eslint-disable-line
}

function sandbox (obj) {
  if (typeof obj !== 'object') {
    throw new TypeError('first argument must be an object')
  }
  return new Proxy(obj, {has})
}

function has () {
  return true
}
