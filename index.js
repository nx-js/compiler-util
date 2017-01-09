'use strict'

const context = require('./src/context')
const modifiers = require('./src/modifiers')
const compiler = require('./src/compiler')

module.exports = {
  compileExpression: compiler.compileExpression,
  compileCode: compiler.compileCode,
  expose: context.expose,
  hide: context.hide,
  hideAll: context.hideAll,
  filter: modifiers.filter,
  limiter: modifiers.limiter
}
