'use strict'

const expect = require('chai').expect
const compiler = require('./compiler')

global.prop1 = 3
global.prop2 = 4
global.propObj = { nestedProp: 'nestedProp' }
global.isSecure = true
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
      expect(expression).to.throw(ReferenceError)
    })

    it('should expose global variables', () => {
      const expression = compiler.compileExpression('prop1 + prop2', {})
      expect(expression()).to.equal(7)
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

  describe('secure()', () => {
    before(() => compiler.secure('prop1', 'propObj', 'localProp', 'setTimeout'))
    beforeEach(() => global.isSecure = true)

    it('should not expose unallowed globals to the sandbox', () => {
      const expression = compiler.compileExpression('prop2', {})
      expect(expression()).to.equal(undefined)
    })

    it('should expose specified globals to the sandbox', () => {
      const expression = compiler.compileExpression('prop1', {})
      expect(expression()).to.equal(3)
    })

    it('should not expose globals inside functions defined in the passed code', () => {
      const code = compiler.compileCode('(function () { isSecure = false })()', {})
      code()
      expect(global.isSecure).to.be.true
    })

    it('should not expose globals inside async functions defined in the passed code', () => {
      const code = compiler.compileCode('setTimeout(() => isSecure = false)', {})
      code()
      expect(global.isSecure).to.be.true
    })

    it('should protect against string manipulation', () => {
      expect(() => compiler.compileCode('isSecure=false})};function this(){}//', {})).to.throw(SyntaxError)
      expect(() => compiler.compileCode('})} isSecure = false; {({', {})).to.throw(SyntaxError)
      expect(global.isSecure).to.be.true
    })

    it('should deep freeze the prototype of literals', () => {
      const literals = ['', 0, true, /o/, {}, [], () => {}]
      for (let literal of literals) {
        expect(Object.isFrozen(Object.getPrototypeOf(literal))).to.be.true
      }
    })

    it('should deep freeze exposed global objects', () => {
      expect(Object.isFrozen(global.propObj)).to.be.true
    })

    it('should generally protect against global object mutation', () => {
      const code1 = compiler.compileCode('("").__proto__.replace = function() {}', {})
      const code2 = compiler.compileCode('({}).__proto__.toJSON = function() {}', {})
      const code3 = compiler.compileCode('({}).constructor.create = function() {}', {})
      const code4 = compiler.compileCode('({}).constructor.prototype.hasOwnProperty = function() {}', {})

      expect(code1).to.throw(TypeError)
      expect(code2).to.throw(TypeError)
      expect(code3).to.throw(TypeError)
      expect(code4).to.throw(TypeError)
    })

    it('should throw on further secure() calls', () => {
      expect(() => compiler.secure('prop3')).to.throw(Error)
    })
  })
})
