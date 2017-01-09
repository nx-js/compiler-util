'use strict'

const expect = require('chai').expect
const compiler = require('../index')

describe('context', () => {
  afterEach(() => compiler.hideAll())

  describe('expose', () => {
    it('should expose the passed global', () => {
      const expression = compiler.compileExpression('console')
      expect(expression({})).to.be.undefined
      compiler.expose('Math', 'console')
      expect(expression({})).to.equal(console)
    })

    it('should favour sandbox props over exposed globals', () => {
      compiler.expose('console')
      const expression = compiler.compileExpression('console')
      expect(expression({ console: 'prop' })).to.equal('prop')
    })

    it('should be chainable', () => {
      const expression = compiler.compileExpression('console')
      expect(expression({})).to.be.undefined
      compiler
        .expose('Math')
        .expose('console')

      expect(expression({})).to.equal(console)
    })
  })

  describe('hide', () => {
    it('should hide exposed globals', () => {
      compiler.expose('Math', 'console')
      const expression = compiler.compileExpression('console')
      expect(expression({})).to.equal(console)
      compiler.hide('Math', 'console')
      expect(expression({})).to.be.undefined
    })

    it('should be chainable', () => {
      const expression = compiler.compileExpression('console')
      expect(expression({})).to.be.undefined
      compiler.expose('console')
      compiler
        .hide('Math')
        .hide('console')

      expect(expression({})).to.be.undefined
    })
  })

  describe('hideAll', () => {
    it('should hide all globals', () => {
      compiler.expose('Math', 'console')
      const expression = compiler.compileExpression('console')
      expect(expression({})).to.equal(console)
      compiler.hideAll()
      expect(expression({})).to.be.undefined
    })

    it('should be chainable', () => {
      const expression = compiler.compileExpression('console')
      expect(expression({})).to.be.undefined
      compiler.expose('console')
      compiler
        .hideAll('Math')
        .expose('console')

      expect(expression({})).to.equal(console)
    })
  })
})
