# nx-compile

This library is part of the [NX framework](http://nx-framework.com).

The purpose of this library is to allow the execution of strings as code in the
context of an object. It combines ES6 Proxies with the JavaScript `with` keyword to achieve this.

## Installation

```
$ npm install @risingstack/nx-compile
```

## Platform support

- Node: 6 and above
- Chrome: 49 and above (after browserified)
- Firefox: 38 and above (after browserified)
- Safari: 10 and above (after browserified)
- Edge: 12 and above (after browserified)
- Opera: 36 and above (after browserified)
- IE is not supported

## Usage

```js
const compiler = require('@risingstack/nx-compile')
```

## API

### compiler.compileCode(String)

This method creates a function out of a string and returns it. The returned function takes
an object as argument and executes the string as code in the context of the passed object.
The string can be any valid javascript code.

```js
const code = compiler.compileCode('return prop1 + prop2')
const sum = code({prop1: 1, prop2: 2}) // sum is 3
```

### compiler.compileExpression(String)

This method creates a function out of a string and returns it. The returned function takes
an object as argument and executes the string as an expression in the context of the passed object.
It returns the result of the evaluated expression. The string can be any javascript expression
that may come after a return statement.

```js
const expression = compiler.compileExpression('prop1 || prop2')
const result = expression({prop2: 'Hello'}) // result is 'Hello'
```

Expressions return undefined instead of throwing a TypeError on invalid property access.
This allows lazy initialization of your data.

```js
const expression = compiler.compileExpression('item.name')
const context = {}

let result = expression(context) // result is undefined, no error is thrown

context.item = {name: 'item name'}
result = expression(context) // result is 'item name'
```

## Example

```js
const compiler = require('@risingstack/nx-compile')

const context = {name: 'nx-compile', version: '4.0.0'}
const expression = compiler.compileExpression('name + version)', sandbox)

// outputs 'nx-compile4.0.0' to console
console.log(expression(context))
```

## Contributions

This library has the very specific purpose of supporting the
[NX framework](https://github.com/RisingStack/nx-framework).
Features should only be added, if they are used by the framework. Otherwise please fork.

Bug fixes, tests and doc updates are always welcome.
Tests and linter (standardJS) must pass.

## Authors

  - [Miklos Bertalan](https://github.com/solkimicreb)

# License

  MIT
