# nx-compile

This library is part of the [NX framework](http://nx-framework.com/).
The purpose of this library is to allow the execution of strings as code in the
context of a sandbox object with optional security restrictions.

## Installation

```
$ npm install @risingstack/nx-compile
```

## Platform support

- Node: 6 and above
- Chrome: 49 and above (after browserified)
- Firefox: 38 and above (after browserified)
- Safari: Technical Preview, 10 and above (after browserified)
- Edge: 12 and above (after browserified)
- Opera: 36 and above (after browserified)
- IE is not supported

## Usage

```js
const compiler = require('@risingstack/nx-compile')
```

## API

### compiler.compileCode(String, Object)

This method creates a function out of a string and returns it. The returned function executes the string as code in the passed sandbox object. The string can be any valid javascript code and it is
always executed in strict mode.

```js
const code = compiler.compileCode('const sum = prop1 + prop2')
```

### compiler.compileExpression(String, Object)

This method creates a function out of a string and returns it. The returned function executes the string as an expression in the passed sandbox object and returns the result of this execution. The string can be any javascript code that may follow a return statement and it is always executed in
strict mode.

```js
const expression = compiler.compileExpression('prop1 || prop2')
```

### compiler.secure(String, ..., String)

This methods secures the sandbox and the compiled code. It prevents access to the global scope
from inside the passed code. You can optionally pass global variable names as strings to expose
them to the sandbox. Exposed global variables and the prototypes of literals (strings, numbers, etc.)
are deep frozen with Object.freeze() to prevent security leaks. Deep frozen means that their whole prototype chain and all constructors found on that prototype chain are frozen. Calling secure more than once throws an error.

```js
compiler.secure('console', 'setTimeout')
```

This method is experimental, please do not use it in a production environment yet!

## Example

```js
const compiler = require('@risingstack/nx-compile')
compiler.secure('console')

const sandbox = {name: 'nx-compile', version: '1.0'}
const code = compiler.compileCode('console.log(name + version)', sandbox)

// outputs 'nx-compile1.0' to console
code()
```

## Features, limitations and edge cases

#### lookup order

The compiled function tries to retrieve the variables first from the sandbox and then from the global object.

```js
const compiler = require('@risingstack/nx-compile')

global.prop = 'globalValue' // in a browser global would be window
const sandbox = {prop: 'sandboxValue'}

const code = compiler.compileCode('console.log(prop)', sandbox)

// outputs 'sandboxValue' to the console
code()


// the key is still present in the sandbox
// outputs 'undefined' to the console
sandbox.prop = undefined
code()

// the key is not present in the sandbox
// outputs 'globalValue' to the console
delete sandbox.prop
code()
```

#### local variables can't be exposed

You can only expose variables declared on the global object.

```js
// this code is assumed to run in a module, so declared variables are not global
const compiler = require('@risingstack/nx-compile')

const localVariable = 'localValue'
const code = compiler.compileCode('console.log(localVariable)', {})

// tries to retrieve 'localVariable' from the global object
// throws a ReferenceError
code()
```

#### 'this' inside the sandboxed code

`this` points to the sandbox inside the sandboxed code.

```js
const compiler = require('@risingstack/nx-compile')

const message = 'local message'
const sandbox = {message: 'sandboxed message'}
const code = compiler.compileCode('console.log(this.message)', sandbox)

// outputs 'sandboxed message' to the console
code()
```

#### functions defined inside the sandboxed code

Functions defined inside the sandboxed code are also sandboxed.

```js
const compiler = require('@risingstack/nx-compile')

const message = 'local message'
const sandbox = {message: 'sandboxed message'}
const code = compiler.compileCode('setTimeout(() => console.log(message))', sandbox)

// outputs 'sandboxed message' to the console
code()
```

#### globals in secure mode

Unexposed global variable access is prevented in secure mode.

```js
const compiler = require('@risingstack/nx-compile')
compiler.secure('console')

const sandbox = {}
const code = compiler.compileCode('console.log(setTimeout)', sandbox)

// console is exposed, setTimeout is not exposed
// outputs 'undefined' to the console
code()
```

#### frozen objects in secure mode

Exposed globals and literal prototypes are frozen in secure mode.

```js
const compiler = require('@risingstack/nx-compile')
compiler.secure('console')

const sandbox = {}
const rawCode = '({}).constructor.create = function(/* evil stuff */) {}'
const code = compiler.compileCode(, sandbox)

// throws a TypeError, Object.create() can not be overwritten
code()
```

## Contributions

This library has the very specific purpose of supporting the [NX framework](https://github.com/RisingStack/nx-framework). Features should only be added, if they are used by the framework. Otherwise please fork.

Bug fixes, tests and doc updates are always welcome.
Tests and linter (standardJS) must pass.

## Authors

  - [Miklos Bertalan](https://github.com/solkimicreb)

# License

  MIT
