'use strict'

const expect = require('chai').expect
const compiler = require('./compiler')

global.prop1 = 3
global.prop2 = 4
const localProp = 1

describe('nx-compile', () => {
  describe('compileCode', () => {
    it('should execute code in a sandbox', () => {
      const code = compiler.compileCode('return prop1 + prop2')
      const value = code({prop1: 1, prop2: 2})
      expect(value).to.equal(3)
    })

    it('should throw TypeError on invalid source argument', () => {
      expect(() => compiler.compileCode({})).to.throw(TypeError)
      expect(() => compiler.compileCode()).to.throw(TypeError)
      expect(() => compiler.compileCode(12)).to.throw(TypeError)
    })
  })

  describe('compileExpression', () => {
    it('should execute expression in a sandbox', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      const value = expression({prop1: 1, prop2: 2})
      expect(value).to.equal(3)
    })

    it('should throw TypeError on invalid source argument', () => {
      expect(() => compiler.compileExpression({})).to.throw(TypeError)
      expect(() => compiler.compileExpression()).to.throw(TypeError)
      expect(() => compiler.compileExpression(12)).to.throw(TypeError)
    })
  })

  describe('returned function (compiled code or expression)', () => {
    it('should expose specified globals to the sandbox', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      const value = expression({}, ['prop1', 'prop2'])
      expect(value).to.equal(7)
    })

    it('should favour sandbox variables over global ones', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      const value = expression({prop1: 1, prop2: 2}, ['prop1', 'prop2'])
      expect(value).to.equal(3)
    })

    it('should expose all globals to the sandbox if true is passed as second arg', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      const value = expression({}, true)
      expect(value).to.equal(7)
    })

    it('should not expose closure variables to the sandbox', () => {
      const expression = compiler.compileExpression('localProp')
      expect(() => expression({}, ['localProp'])).to.throw(ReferenceError)
    })

    it('should throw TypeError on invalid sandbox argument', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      expect(() => expression()).to.throw(TypeError)
      expect(() => expression(12)).to.throw(TypeError)
      expect(() => expression({}, 'string')).to.throw(TypeError)
      expect(() => expression({}, false)).to.throw(TypeError)
    })

    it('should throw TypeError on invalid allowedGlobals argument', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      expect(() => expression({}, 'string')).to.throw(TypeError)
      expect(() => expression({}, false)).to.throw(TypeError)
    })
  })
})
