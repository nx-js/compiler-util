'use strict'

module.exports = {
  compileCode,
  compileExpression
}

const expressionCache = new Map()
const codeCache = new Map()

function compileExpression (src, sandbox) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  if (typeof sandbox !== 'object') {
    throw new TypeError('second argument must be an object')
  }
  sandbox = new Proxy(sandbox, {has})
  let expression = expressionCache.get(src)
  if (!expression) {
    expression = new Function('sandbox',
      `try { with (sandbox) { return ${src} } } catch (err) {
        if (!(err instanceof ReferenceError || err instanceof TypeError)) throw err
      }`)
    expressionCache.set(src, expression)
  }
  return expression.bind(sandbox, sandbox) // eslint-disable-line
}

function compileCode (src, sandbox) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  if (typeof sandbox !== 'object') {
    throw new TypeError('second argument must be an object')
  }
  sandbox = new Proxy(sandbox, {has})
  let code = codeCache.get(src)
  if (!code) {
    code = new Function('sandbox', `with (sandbox) { ${src} }`)
    codeCache.set(src, code)
  }
  return code.bind(sandbox, sandbox) // eslint-disable-line
}

function has () {
  return true
}
