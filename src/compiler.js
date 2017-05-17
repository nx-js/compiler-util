'use strict'

const parser = require('./parser')

const expressionCache = new Map()
const codeCache = new Map()

module.exports = {
  compileExpression,
  compileCode
}

function compileExpression (src) {
  if (typeof src !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  let expression = expressionCache.get(src)
  if (!expression) {
    expression = parser.parseExpression(src)
    expressionCache.set(src, expression)
  }

  if (typeof expression === 'function') {
    return expression
  }

  return function evaluateExpression (context, tempVars) {
    let value = expression.exec(context, tempVars)
    for (let filter of expression.filters) {
      const args = filter.argExpressions.map(evaluateArgExpression, context)
      value = filter.effect(value, ...args)
    }
    return value
  }
}

function compileCode (src) {
  if (typeof src !== 'string') {
    throw new TypeError('First argument must be a string.')
  }
  let code = codeCache.get(src)
  if (!code) {
    code = parser.parseCode(src)
    codeCache.set(src, code)
  }

  if (typeof code === 'function') {
    return code
  }

  const context = {}
  return function evaluateCode (state, tempVars) {
    let i = 0
    function next () {
      Object.assign(context, tempVars)
      if (i < code.limiters.length) {
        const limiter = code.limiters[i++]
        const args = limiter.argExpressions.map(evaluateArgExpression, state)
        limiter.effect(next, context, ...args)
      } else {
        code.exec(state, tempVars)
      }
    }
    next()
  }
}

function evaluateArgExpression (argExpression) {
  return argExpression(this)
}
