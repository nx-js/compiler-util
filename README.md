# nx-compile

This library is part of the **nx framework**.
The purpose of this library is to allow the execution of strings as code in a secure, sandboxed environment.

## Installation

```
$ TODO: add to npm
```

## Compatibility

## Usage

```js
const compiler = require('nx-compile')
```

## API

### compiler.compileCode(String)

This method creates a function out of a string and returns it. The returned function executes the string as code in a sandbox.

```js
const code = compiler.compileCode('any valid js code')
```

### compiler.compileExpression(String)

This method creates a function out of a string and returns it. The returned function executes the string as an expression in a sandbox and returns the result of the execution.

```js
const expression = compiler.compileExpression('any js code that can come after a return')
```

### using the returned function, expression(Object, [Array | true])

Pass an object as the first argument, this will be the sandbox the function executes in. Optionally you can expose global variables by passing an Array of variable names as second argument. Passing true as the second argument exposes every global variable.

```js
const result = expression({prop1: 'someValue', prop2: 'someOtherValue'}, ['LocalStorage'])
```

## Example

```js
const compiler = require('nx-compile')

const code = compiler.compileCode('console.log(name + version)')

// outputs 'nx-compile1.0' to console
code({name: 'nx-compile', version: '1.0'}, ['console'])

// outputs '1.0' to console (name is undefined)
code({version: '1.0'}, ['console'])

// throws an error (console is undefined)
code({name: 'nx-compile', version: '1.0'})
```

## Authors

  - [Miklos Bertalan](https://github.com/solkimicreb)

# License

  MIT
