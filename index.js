'use strict'

const context = require('./src/context')
const modifiers = require('./src/modifiers')
const compiler = require('./src/compiler')
const rawCompiler = require('./src/rawCompiler')

module.exports = {
  compileExpression: compiler.compileExpression,
  compileCode: compiler.compileCode,
  compileRawExpression: rawCompiler.compileExpression,
  compileRawCode: rawCompiler.compileCode,
  expose: context.expose,
  hide: context.hide,
  hideAll: context.hideAll,
  filter: modifiers.filter,
  limiter: modifiers.limiter
}
