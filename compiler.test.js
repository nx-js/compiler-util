'use strict'

const expect = require('chai').expect
const compiler = require('./compiler')

const localProp = 'localProp'
global.globalProp = 'globalProp'

describe('nx-compile', () => {
  describe('compileCode()', () => {
    it('should throw a TypeError on non string source argument', () => {
      expect(() => compiler.compileCode({})).to.throw(TypeError)
      expect(() => compiler.compileCode(undefined)).to.throw(TypeError)
      expect(() => compiler.compileCode(12)).to.throw(TypeError)
    })
  })

  describe('compileExpression()', () => {
    it('should throw a TypeError on non string source argument', () => {
      expect(() => compiler.compileCode({})).to.throw(TypeError)
      expect(() => compiler.compileCode(undefined)).to.throw(TypeError)
      expect(() => compiler.compileCode(12)).to.throw(TypeError)
    })
  })

  describe('returned function (compiled code or expression)', () => {
    it('should throw a TypeError on non object sandbox argument', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      expect(() => expression()).to.throw(TypeError)
      expect(() => expression('string')).to.throw(TypeError)
      expect(() => expression(12)).to.throw(TypeError)
    })

    it('should execute in the context of the sandbox', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      expect(expression({prop1: 1, prop2: 2})).to.equal(3)
    })

    it('should not expose local variables', () => {
      const expression = compiler.compileExpression('localProp')
      expect(expression({})).to.equal(undefined)
    })

    it('should not expose global variables', () => {
      const expression = compiler.compileExpression('globalProp')
      expect(expression({})).to.equal(undefined)
    })
  })

  describe('returned function expression', () => {
    it('should return undefined instead of throwing on invalid property access', () => {
      const expression = compiler.compileExpression('inner.prop1')
      expect(() => expression({})).to.not.throw(TypeError)
      expect(expression({})).to.equal(undefined)
    })
  })

  describe('returned code expression', () => {
    it('should throw on invalid property access', () => {
      const code = compiler.compileCode('inner.prop1')
      expect(() => code({})).to.throw(TypeError)
    })
  })
})
