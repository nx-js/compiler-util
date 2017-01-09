'use strict'

module.exports = {
  compileCode,
  compileExpression
}

function compileExpression (src) {
  return new Function('context', // eslint-disable-line
    `const sandbox = $nxCompileToSandbox(context)
    try { with (sandbox) { return ${src} } } catch (err) {
      if (!(err instanceof TypeError)) throw err
    }`)
}

function compileCode (src) {
  return new Function('context', 'tempVars', // eslint-disable-line
    `const backup = $nxCompileCreateBackup(context, tempVars)
    Object.assign(context, tempVars)
    const sandbox = $nxCompileToSandbox(context)
    try {
      with (sandbox) { ${src} }
    } finally {
      Object.assign(context, backup)
    }`)
}
