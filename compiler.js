'use strict'

module.exports = {
  compileCode,
  compileExpression,
  expose,
  hide
}

let globalObj
if (typeof window !== 'undefined') globalObj = window // eslint-disable-line
else if (typeof global !== 'undefined') globalObj = global // eslint-disable-line
else if (typeof self !== 'undefined') globalObj = self // eslint-disable-line
globalObj.$nxCompileToSandbox = toSandbox
globalObj.$nxCompileCreateBackup = createBackup

const proxies = new WeakMap()
const expressionCache = new Map()
const codeCache = new Map()
const globals = new Set()
const handlers = {has}

function compileExpression (src) {
  if (typeof src !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  let expression = expressionCache.get(src)
  if (!expression) {
    expression = new Function('context', // eslint-disable-line
      `const sandbox = $nxCompileToSandbox(context)
      try { with (sandbox) { return ${src} } } catch (err) {
        if (!(err instanceof TypeError)) throw err
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
    code = new Function('context', 'tempVars', // eslint-disable-line
    `const backup = $nxCompileCreateBackup(context, tempVars)
    Object.assign(context, tempVars)
    const sandbox = $nxCompileToSandbox(context)
    try {
      with (sandbox) { ${src} }
    } finally {
      Object.assign(context, backup)
    }`)
    codeCache.set(src, code)
  }
  return code
}

function expose (globalName) {
  if (typeof globalName !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  globals.add(globalName)
}

function hide (globalName) {
  if (typeof globalName !== 'string') {
    throw new TypeError('first argument must be a string')
  }
  globals.delete(globalName)
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

function createBackup (context, tempVars) {
  if (typeof tempVars === 'object') {
    const backup = {}
    for (let key of Object.keys(tempVars)) {
      backup[key] = context[key]
    }
    return backup
  }
}

function has (target, key) {
  return globals.has(key) ? Reflect.has(target, key) : true
}
