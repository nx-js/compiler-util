'use strict'

const globals = new Set()
const proxies = new WeakMap()
const tempVarStore = new WeakMap()
const handlers = {has, get}

let globalObj
if (typeof window !== 'undefined') globalObj = window // eslint-disable-line
else if (typeof global !== 'undefined') globalObj = global // eslint-disable-line
else if (typeof self !== 'undefined') globalObj = self // eslint-disable-line
globalObj.$nxCompileToSandbox = toSandbox
globalObj.$nxClearSandbox = clearSandbox

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

function get (target, key, receiver) {
  const tempVars = tempVarStore.get(target)
  if (tempVars && (key in tempVars)) {
    return tempVars[key]
  }
  return Reflect.get(target, key, receiver)
}

function toSandbox (obj, tempVars) {
  tempVarStore.set(obj, tempVars)
  let sandbox = proxies.get(obj)
  if (!sandbox) {
    sandbox = new Proxy(obj, handlers)
    proxies.set(obj, sandbox)
  }
  return sandbox
}

function clearSandbox (obj) {
  tempVarStore.delete(obj)
}
