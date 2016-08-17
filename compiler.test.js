'use strict'

const expect = require('chai').expect
const compiler = require('./compiler')

global.prop1 = 3
global.prop2 = 4
const localProp = 1

describe('nx-compile', () => {
  describe('compileCode', () => {
    it('should throw TypeError on invalid source argument', () => {
      expect(() => compiler.compileCode({})).to.throw(TypeError)
      expect(() => compiler.compileCode()).to.throw(TypeError)
      expect(() => compiler.compileCode(12)).to.throw(TypeError)
    })
  })

  describe('compileExpression', () => {
    it('should throw TypeError on invalid source argument', () => {
      expect(() => compiler.compileExpression({})).to.throw(TypeError)
      expect(() => compiler.compileExpression()).to.throw(TypeError)
      expect(() => compiler.compileExpression(12)).to.throw(TypeError)
    })
  })

  describe('returned function (compiled code or expression)', () => {
    it('should execute in a sandbox', () => {
      const expression = compiler.compileExpression('prop1 + prop2')
      const value = expression({prop1: 1, prop2: 2})
      expect(value).to.equal(3)
    })

    it('should not expose globals to the sandbox', () => {
      const expression = compiler.compileExpression('prop1')
      const value = expression({})
      expect(value).to.equal(undefined)
    })

    it('should not expose globals inside functions defined in the passed code', () => {
      const rawCode = '({}).__proto__.evil = function() { return prop1 + prop2 }'
      const code = compiler.compileCode(rawCode)
      code({prop1: 1, prop2: 2})
      expect(({}).evil()).to.equal(3)
    })

    it('"this" should be the sandbox instead of the global object', () => {
      const expression = compiler.compileExpression('this.prop1 + this.prop2')
      const value = expression({prop1: 1, prop2: 2}, [])
      expect(value).to.equal(3)
    })

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
