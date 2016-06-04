# nx-compile

This library is part of the **nx framework** (coming soon).
The purpose of this library is to allow the execution of strings as code in a secure, sandboxed environment.

## Installation

```
$ TODO: add to npm
```

## Platform support

- Node: 6 and above
- Chrome: 49 and above (after browserified)
- Firefox: 18 and above (after browserified)
- Edge: 13 and above (after browserified)

## Usage

```js
const compiler = require('nx-compile')
```

## API

### compiler.compileCode(String)

This method creates a function out of a string and returns it. The returned function executes the string as code in a sandbox. The string can be any valid javascript code.

```js
const code = compiler.compileCode('const sum = prop1 + prop2')
```

### compiler.compileExpression(String)

This method creates a function out of a string and returns it. The returned function executes the string as an expression in a sandbox and returns the result of this execution. The string can be any javascript code that may follow a return statement.

```js
const expression = compiler.compileExpression('prop1 || prop2')
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

// outputs 'undefined1.0' to console (name is undefined)
code({version: '1.0'}, ['console'])

// throws a ReferenceError (console is undefined)
code({name: 'nx-compile', version: '1.0'})
```

## Features, limitations and edge cases

#### difference between global and sandbox variables

Javascript throws a ReferenceError if you try to read undeclared variables. The sandbox is more forgiving. It will read it as undefined instead.

```js
const compiler = require('nx-compile')

const code = compiler.compileCode('console.log(nonExistentVar)')

// tries to retrieve 'nonExistentVar' from the (forgiving) sandbox
// outputs 'undefined' to the console
code({}, ['console'])

// tries to retrieve 'nonExistentVar' from the global object
// throws a ReferenceError
code({}, ['console', 'nonExistentVar'])
```

#### lookup order

The compiled function tries to retrieve the variables first from the sandbox and then from the global object (if exposed by the second parameter).

```js
const compiler = require('nx-compile')

global.prop = 'globalValue' // in a browser global would be window
const sandbox = {prop: 'sandboxValue'}

const code = compiler.compileCode('console.log(prop)')

// outputs 'sandboxValue' to the console
code(sandbox, ['console', 'prop'])

sandbox.prop = undefined

// the key is still present in the sandbox
// outputs 'undefined' to the console
code(sandbox, ['console', 'prop'])

delete sandbox.prop

// the key is not present in the sandbox
// outputs 'globalValue' to the console
code(sandbox, ['console', 'prop'])
```

#### local variables can't be exposed

You can only expose variables declared on the global object.

```js
// this code is assumed to run in a module, so declared variables are not global
const compiler = require('nx-compile')

const localVariable = 'localValue'
const code = compiler.compileCode('console.log(localVariable)')

// tries to retrieve 'localVariable' from the global object
// throws a ReferenceError
code({}, ['console', 'localVariable'])
```

## Contributions

This library has the very specific purpose of supporting the nx framework. Features should only be added, if they are used by the framework. Otherwise please fork.

Bug fixes, tests and doc updates are always welcome.
Tests and linter (standardJS) must pass.

## Authors

  - [Miklos Bertalan](https://github.com/solkimicreb)

# License

  MIT
