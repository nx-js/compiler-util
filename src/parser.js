import { limiters, filters } from './modifiers'
import { compileRawExpression, compileRawCode } from './rawCompiler'

const filterRegex = /(?:[^\|]|\|\|)+/g
const limiterRegex = /(?:[^&]|&&)+/g
const argsRegex = /\S+/g

export function parseExpression (src) {
  const tokens = src.match(filterRegex)
  if (tokens.length === 1) {
    return compileRawExpression(tokens[0])
  }

  const expression = {
    exec: compileRawExpression(tokens[0]),
    filters: []
  }
  for (let i = 1; i < tokens.length; i++) {
    let filterTokens = tokens[i].match(argsRegex)
    const filterName = filterTokens.shift()
    const effect = filters.get(filterName)
    if (!effect) {
      throw new Error(`There is no filter named: ${filterName}.`)
    }
    expression.filters.push({effect, argExpressions: filterTokens.map(compileRawExpression)})
  }
  return expression
}

export function parseCode (src) {
  const tokens = src.match(limiterRegex)
  if (tokens.length === 1) {
    return compileRawCode(tokens[0])
  }

  const code = {
    exec: compileRawCode(tokens[0]),
    limiters: []
  }
  for (let i = 1; i < tokens.length; i++) {
    const limiterTokens = tokens[i].match(argsRegex)
    const limiterName = limiterTokens.shift()
    const effect = limiters.get(limiterName)
    if (!effect) {
      throw new Error(`There is no limiter named: ${limiterName}.`)
    }
    code.limiters.push({effect, argExpressions: limiterTokens.map(compileRawExpression)})
  }
  return code
}
