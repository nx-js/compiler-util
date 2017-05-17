'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const filters = new Map();
const limiters = new Map();

function filter (name, handler) {
  if (typeof name !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  if (typeof handler !== 'function') {
    throw new TypeError('Second argument must be a function.')
  }
  if (filters.has(name)) {
    throw new Error(`A filter named ${name} is already registered.`)
  }
  filters.set(name, handler);
  return this
}

function limiter (name, handler) {
  if (typeof name !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  if (typeof handler !== 'function') {
    throw new TypeError('Second argument must be a function.')
  }
  if (limiters.has(name)) {
    throw new Error(`A limiter named ${name} is already registered.`)
  }
  limiters.set(name, handler);
  return this
}

function compileRawExpression (src) {
  return new Function('context', 'tempVars', // eslint-disable-line
    `const sandbox = $nxCompileToSandbox(context, tempVars)
    try { with (sandbox) { return ${src} } } catch (err) {
      if (!(err instanceof TypeError)) throw err
    }
    $nxClearSandbox()`)
}

function compileRawCode (src) {
  return new Function('context', 'tempVars', // eslint-disable-line
    `const sandbox = $nxCompileToSandbox(context, tempVars)
    with (sandbox) { ${src} }
    $nxClearSandbox()`)
}

const filterRegex = /(?:[^\|]|\|\|)+/g;
const limiterRegex = /(?:[^&]|&&)+/g;
const argsRegex = /\S+/g;

function parseExpression (src) {
  const tokens = src.match(filterRegex);
  if (tokens.length === 1) {
    return compileRawExpression(tokens[0])
  }

  const expression = {
    exec: compileRawExpression(tokens[0]),
    filters: []
  };
  for (let i = 1; i < tokens.length; i++) {
    let filterTokens = tokens[i].match(argsRegex) || [];
    const filterName = filterTokens.shift();
    const effect = filters.get(filterName);
    if (!effect) {
      throw new Error(`There is no filter named: ${filterName}.`)
    }
    expression.filters.push({effect, argExpressions: filterTokens.map(compileRawExpression)});
  }
  return expression
}

function parseCode (src) {
  const tokens = src.match(limiterRegex);
  if (tokens.length === 1) {
    return compileRawCode(tokens[0])
  }

  const code = {
    exec: compileRawCode(tokens[0]),
    limiters: []
  };
  for (let i = 1; i < tokens.length; i++) {
    const limiterTokens = tokens[i].match(argsRegex) || [];
    const limiterName = limiterTokens.shift();
    const effect = limiters.get(limiterName);
    if (!effect) {
      throw new Error(`There is no limiter named: ${limiterName}.`)
    }
    code.limiters.push({effect, argExpressions: limiterTokens.map(compileRawExpression)});
  }
  return code
}

const expressionCache = new Map();
const codeCache = new Map();

function compileExpression (src) {
  if (typeof src !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  let expression = expressionCache.get(src);
  if (!expression) {
    expression = parseExpression(src);
    expressionCache.set(src, expression);
  }

  if (typeof expression === 'function') {
    return expression
  }

  return function evaluateExpression (context, tempVars) {
    let value = expression.exec(context, tempVars);
    for (let filter of expression.filters) {
      const args = filter.argExpressions.map(evaluateArgExpression, context);
      value = filter.effect(value, ...args);
    }
    return value
  }
}

function compileCode (src) {
  if (typeof src !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  let code = codeCache.get(src);
  if (!code) {
    code = parseCode(src);
    codeCache.set(src, code);
  }

  if (typeof code === 'function') {
    return code
  }

  const context = {};
  return function evaluateCode (state, tempVars) {
    let i = 0;
    function next () {
      Object.assign(context, tempVars);
      if (i < code.limiters.length) {
        const limiter = code.limiters[i++];
        const args = limiter.argExpressions.map(evaluateArgExpression, state);
        limiter.effect(next, context, ...args);
      } else {
        code.exec(state, tempVars);
      }
    }
    next();
  }
}

function evaluateArgExpression (argExpression) {
  return argExpression(this)
}

const hasHandler = { has };
const allHandlers = { has, get };
const globals = new Set();
let temp;

let globalObj;
if (typeof window !== 'undefined') globalObj = window; // eslint-disable-line
else if (typeof global !== 'undefined') globalObj = global; // eslint-disable-line
else if (typeof self !== 'undefined') globalObj = self; // eslint-disable-line
globalObj.$nxCompileToSandbox = toSandbox;
globalObj.$nxClearSandbox = clearSandbox;

function expose (...globalNames) {
  for (let globalName of globalNames) {
    globals.add(globalName);
  }
  return this
}

function hide (...globalNames) {
  for (let globalName of globalNames) {
    globals.delete(globalName);
  }
  return this
}

function hideAll () {
  globals.clear();
  return this
}

function has (target, key) {
  return globals.has(key) ? (key in target) : true
}

function get (target, key) {
  return key in temp ? temp[key] : target[key]
}

function toSandbox (obj, tempVars) {
  if (tempVars) {
    temp = tempVars;
    return new Proxy(obj, allHandlers)
  }
  return new Proxy(obj, hasHandler)
}

function clearSandbox () {
  temp = undefined;
}

exports.compileExpression = compileExpression;
exports.compileCode = compileCode;
exports.compileRawExpression = compileRawExpression;
exports.compileRawCode = compileRawCode;
exports.expose = expose;
exports.hide = hide;
exports.hideAll = hideAll;
exports.filters = filters;
exports.limiters = limiters;
exports.filter = filter;
exports.limiter = limiter;
