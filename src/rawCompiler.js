'use strict'

module.exports = {
  compileCode,
  compileExpression
}

function compileExpression (src) {
  return new Function('context', 'tempVars', // eslint-disable-line
    `const sandbox = $nxCompileToSandbox(context, tempVars)
    try { with (sandbox) { return ${src} } } catch (err) {
      if (!(err instanceof TypeError)) throw err
    }
    $nxClearSandbox()`)
}

function compileCode (src) {
  return new Function('context', 'tempVars', // eslint-disable-line
    `const sandbox = $nxCompileToSandbox(context, tempVars)
    with (sandbox) { ${src} }
    $nxClearSandbox()`)
}
