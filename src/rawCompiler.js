const isSimple = /^(\w|\.)+$/

export function compileRawExpression (src) {
  return isSimple.test(src) ? compileSimpleExpression(src) : compileComplexExpression(src)
}

function compileSimpleExpression (src) {
  return new Function('context', 'tempVars', // eslint-disable-line
    `if (tempVars) {
      try { return tempVars.${src} } catch (err) {
        if (!(err instanceof TypeError)) throw err
      }
    }
    try { return context.${src} } catch (err) {
      if (!(err instanceof TypeError)) throw err
    }`)
}

function compileComplexExpression (src) {
  return new Function('context', 'tempVars', // eslint-disable-line
    `const sandbox = $nxCompileToSandbox(context, tempVars)
    try { with (sandbox) { return ${src} } } catch (err) {
      if (!(err instanceof TypeError)) throw err
    }
    $nxClearSandbox()`)
}

export function compileRawCode (src) {
  return new Function('context', 'tempVars', // eslint-disable-line
    `const sandbox = $nxCompileToSandbox(context, tempVars)
    with (sandbox) { ${src} }
    $nxClearSandbox()`)
}
