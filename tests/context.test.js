import { expect } from 'chai'
import * as compiler from '@nx-js/compiler-util'

// this file fails if any other test case come after this!
// TODO: figure out why
describe('context', () => {
  afterEach(() => compiler.hideAll())

  describe('expose', () => {
    it('should expose the passed global', () => {
      const expression = compiler.compileExpression('Math')
      expect(expression({})).to.be.undefined
      compiler.expose('Math', 'console')
      expect(expression({})).to.equal(Math)
    })

    it('should favour sandbox props over exposed globals', () => {
      compiler.expose('console')
      const expression = compiler.compileExpression('console')
      expect(expression({ console: 'prop' })).to.equal('prop')
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
  })

  describe('hideAll', () => {
    it('should hide all globals', () => {
      compiler.expose('Math', 'console')
      const expression = compiler.compileExpression('console')
      expect(expression({})).to.equal(console)
      compiler.hideAll()
      expect(expression({})).to.be.undefined
    })
  })
})
