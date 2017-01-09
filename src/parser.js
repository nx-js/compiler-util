'use strict'

const modifiers = require('./modifiers')
const rawCompiler = require('./rawCompiler')

const filterRegex = /(?:[^\|]|\|\|)+/g
const limiterRegex = /(?:[^&]|&&)+/g
const argsRegex = /\S+/g

module.exports = {
  parseExpression,
  parseCode
}

function parseExpression (src) {
  const tokens = src.match(filterRegex)
  if (tokens.length === 1) {
    return rawCompiler.compileExpression(tokens[0])
  }

  const expression = {
    exec: rawCompiler.compileExpression(tokens[0]),
    filters: []
  }
  for (let i = 1; i < tokens.length; i++) {
    let filterTokens = tokens[i].match(argsRegex) || []
    const filterName = filterTokens.shift()
    const effect = modifiers.filters.get(filterName)
    if (!effect) {
      throw new Error(`There is no filter named: ${filterName}.`)
    }
    expression.filters.push({effect, argExpressions: filterTokens.map(compileArgExpression)})
  }
  return expression
}

function parseCode (src) {
  const tokens = src.match(limiterRegex)
  if (tokens.length === 1) {
    return rawCompiler.compileCode(tokens[0])
  }

  const code = {
    exec: rawCompiler.compileCode(tokens[0]),
    limiters: []
  }
  for (let i = 1; i < tokens.length; i++) {
    const limiterTokens = tokens[i].match(argsRegex) || []
    const limiterName = limiterTokens.shift()
    const effect = modifiers.limiters.get(limiterName)
    if (!effect) {
      throw new Error(`There is no limiter named: ${limiterName}.`)
    }
    code.limiters.push({effect, argExpressions: limiterTokens.map(compileArgExpression)})
  }
  return code
}

function compileArgExpression (argExpression) {
  return rawCompiler.compileExpression(argExpression)
}
