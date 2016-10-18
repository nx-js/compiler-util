'use strict'

const expect = require('chai').expect
const compiler = require('./compiler')

global.prop1 = 3
global.prop2 = 4
const localProp = 1

describe('nx-compile', () => {
  describe('compileCode()', () => {
    it('should throw TypeError on invalid source argument', () => {
      expect(() => compiler.compileCode({}, {})).to.throw(TypeError)
      expect(() => compiler.compileCode(undefined, {})).to.throw(TypeError)
      expect(() => compiler.compileCode(12, {})).to.throw(TypeError)
    })

    it('should throw TypeError on invalid sandbox argument', () => {
      expect(() => compiler.compileExpression('prop1 + prop2', 12)).to.throw(TypeError)
      expect(() => compiler.compileExpression('prop1 + prop2', undefined)).to.throw(TypeError)
      expect(() => compiler.compileExpression('prop1 + prop2', '')).to.throw(TypeError)
    })
  })

  describe('compileExpression()', () => {
    it('should throw TypeError on invalid source argument', () => {
      expect(() => compiler.compileCode({}, {})).to.throw(TypeError)
      expect(() => compiler.compileCode(undefined, {})).to.throw(TypeError)
      expect(() => compiler.compileCode(12, {})).to.throw(TypeError)
    })

    it('should throw TypeError on invalid sandbox argument', () => {
      expect(() => compiler.compileExpression('prop1 + prop2', 12)).to.throw(TypeError)
      expect(() => compiler.compileExpression('prop1 + prop2', undefined)).to.throw(TypeError)
      expect(() => compiler.compileExpression('prop1 + prop2', '')).to.throw(TypeError)
    })
  })

  describe('returned function (compiled code or expression)', () => {
    it('should execute in the context of the sandbox', () => {
      const expression = compiler.compileExpression('prop1 + prop2', {prop1: 1, prop2: 2})
      expect(expression()).to.equal(3)
    })

    it('should not expose local variables', () => {
      const expression = compiler.compileExpression('localProp', {})
      expect(expression()).to.equal(undefined)
    })

    it('should favour sandbox variables over global ones', () => {
      const expression = compiler.compileExpression('prop1 + prop2', {prop1: 1, prop2: 2})
      expect(expression()).to.equal(3)
    })

    it('should set "this" to the sandbox instead of the global object', () => {
      const expression = compiler.compileExpression('this.prop1 + this.prop2', {prop1: 1, prop2: 2})
      expect(expression()).to.equal(3)
    })

    it('should set "this" to be undefined inside functions defined in the passed code', () => {
      const code = compiler.compileCode('(function () { return this })()', {})
      expect(code()).to.equal(undefined)
    })
  })
})
