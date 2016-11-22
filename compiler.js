'use strict'

module.exports = {
  compileCode,
  compileExpression
}

let globalObj
if (typeof window !== 'undefined') globalObj = window // eslint-disable-line
else if (typeof global !== 'undefined') globalObj = global // eslint-disable-line
else if (typeof self !== 'undefined') globalObj = self // eslint-disable-line
globalObj.$nxCompileToSandbox = toSandbox

const proxies = new WeakMap()
const expressionCache = new Map()
const codeCache = new Map()
const handlers = {has}

function compileExpression (src) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  let expression = expressionCache.get(src)
  if (!expression) {
    expression = new Function('sandbox', // eslint-disable-line
      `sandbox = $nxCompileToSandbox(sandbox)
      try { with (sandbox) { return ${src} } } catch (err) {
        if (!(err instanceof ReferenceError || err instanceof TypeError)) throw err
      }`)
    expressionCache.set(src, expression)
  }
  return expression
}

function compileCode (src) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  let code = codeCache.get(src)
  if (!code) {
    code = new Function('sandbox', // eslint-disable-line
    `sandbox = $nxCompileToSandbox(sandbox)
    with (sandbox) { ${src} }`)
    codeCache.set(src, code)
  }
  return code
}

function toSandbox (obj) {
  if (typeof obj !== 'object') {
    throw new TypeError('first argument must be an object')
  }
  let sandbox = proxies.get(obj)
  if (!sandbox) {
    sandbox = new Proxy(obj, handlers)
    proxies.set(obj, sandbox)
  }
  return sandbox
}

function has () {
  return true
}
