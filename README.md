# nx-compile

This library is part of the [NX framework](http://nx-framework.com/).
The purpose of this library is to allow the execution of strings as code in the
context of a sandbox object.

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

## Example

```js
const compiler = require('@risingstack/nx-compile')

const sandbox = {name: 'nx-compile', version: '3.0.0'}
const expression = compiler.compileExpression('name + version', sandbox)

// outputs 'nx-compile3.0.0' to console
console.log(expression())
```

## Contributions

This library has the very specific purpose of supporting the [NX framework](https://github.com/RisingStack/nx-framework). Features should only be added, if they are used by the framework. Otherwise please fork.

Bug fixes, tests and doc updates are always welcome.
Tests and linter (standardJS) must pass.

## Authors

  - [Miklos Bertalan](https://github.com/solkimicreb)

# License

  MIT
