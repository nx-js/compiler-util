'use strict'

const globals = new Set()
const proxies = new WeakMap()
const handlers = {has}

let globalObj
if (typeof window !== 'undefined') globalObj = window // eslint-disable-line
else if (typeof global !== 'undefined') globalObj = global // eslint-disable-line
else if (typeof self !== 'undefined') globalObj = self // eslint-disable-line
globalObj.$nxCompileToSandbox = toSandbox
globalObj.$nxCompileCreateBackup = createBackup

module.exports = {
  expose,
  hide,
  hideAll
}

function expose (...globalNames) {
  for (let globalName of globalNames) {
    globals.add(globalName)
  }
  return this
}

function hide (...globalNames) {
  for (let globalName of globalNames) {
    globals.delete(globalName)
  }
  return this
}

function hideAll () {
  globals.clear()
  return this
}

function has (target, key) {
  return globals.has(key) ? Reflect.has(target, key) : true
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
