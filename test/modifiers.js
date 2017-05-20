'use strict'

require('reify')

const expect = require('chai').expect
const compiler = require('../src/index')

describe('context', () => {
  afterEach(() => compiler.hideAll())

  describe('filter', () => {
    it('should throw a TypeError on invalid arguments', () => {
      expect(() => compiler.filter(12, () => {})).to.throw(TypeError)
      expect(() => compiler.filter('name')).to.throw(TypeError)
      expect(() => compiler.filter('name', () => {})).to.not.throw
    })

    it('should throw an Error when a filter is already registered by the name', () => {
      compiler.filter('filter', () => {})
      expect(() => compiler.filter('filter', () => {})).to.throw(Error)
    })

    it('should register a filter for expressions', () => {
      compiler.filter('capitalize', txt => txt.toUpperCase())
      const expression = compiler.compileExpression('message | capitalize')
      expect(expression({message: 'hello'})).to.equal('HELLO')
    })

    it('should accept extra arguments', () => {
      compiler.filter('slice', (txt, start, end) => txt.slice(start, end))
      const expression = compiler.compileExpression('message | slice start end')
      expect(expression({message: 'hello', start: 1, end: 4})).to.equal('ell')
    })

    it('should pipe with other filters', () => {
      const expression = compiler.compileExpression('message | slice 1 4 | capitalize')
      expect(expression({message: 'hello'})).to.equal('ELL')
    })
  })

  describe('limiter', () => {
    it('should throw a TypeError on invalid arguments', () => {
      expect(() => compiler.limiter(12, () => {})).to.throw(TypeError)
      expect(() => compiler.limiter('name')).to.throw(TypeError)
      expect(() => compiler.limiter('name', () => {})).to.not.throw
    })

    it('should throw an Error when a limiter is already registered by the name', () => {
      compiler.limiter('limiter', () => {})
      expect(() => compiler.limiter('limiter', () => {})).to.throw(Error)
    })

    it('should register a limiter for code', () => {
      compiler.limiter('block', () => {})
      const increment = compiler.compileCode('counter++')
      const blocked = compiler.compileCode('counter++ & block')
      const context = {counter: 0}

      increment(context)
      expect(context.counter).to.equal(1)
      blocked(context)
      expect(context.counter).to.equal(1)
    })

    it('should accept extra arguments', () => {
      compiler.limiter('if', (next, context, condition) => {
        if (condition) next()
      })

      const increment = compiler.compileCode('counter++ & if condition')
      const context = {counter: 0, condition: true}

      increment(context)
      expect(context.counter).to.equal(1)

      context.condition = false
      increment(context)
      expect(context.counter).to.equal(1)
    })

    it('should allow deferred execution', () => {
      compiler.limiter('nextTick', next => Promise.resolve().then(next))

      const increment = compiler.compileCode('counter++ & nextTick')
      const context = {counter: 0, condition: true}

      increment(context)
      expect(context.counter).to.equal(0)

      return Promise.resolve()
        .then(() => expect(context.counter).to.equal(1))
    })

    it('should keep a limiter context', () => {
      compiler.limiter('blockOdd', (next, context) => {
        context.shouldBlock = !context.shouldBlock
        if (!context.shouldBlock) next()
      })

      const increment = compiler.compileCode('counter++ & blockOdd')
      const context = {counter: 0}

      increment(context)
      expect(context.counter).to.equal(0)

      increment(context)
      expect(context.counter).to.equal(1)

      increment(context)
      expect(context.counter).to.equal(1)

      increment(context)
      expect(context.counter).to.equal(2)

      increment(context)
      expect(context.counter).to.equal(2)
    })

    it('shoulds should not share limiter context between codes', () => {
      const increment1 = compiler.compileCode('counter++ & blockOdd')
      const increment2 = compiler.compileCode('counter++ & blockOdd')
      const context = {counter: 0}

      increment1(context)
      expect(context.counter).to.equal(0)

      increment2(context)
      expect(context.counter).to.equal(0)

      increment1(context)
      expect(context.counter).to.equal(1)

      increment2(context)
      expect(context.counter).to.equal(2)
    })
  })
})
