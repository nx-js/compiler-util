# The compiler util

This library is part of the [NX framework](http://nx-framework.com).

The main purpose of this library is to allow the execution of strings as code in the
context of an object.

## Installation

```
$ npm install @nx-js/compiler-util
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
const compiler = require('@nx-js/compiler-util')
```

### Compiling code

`compiler.compileCode(string)` creates a function from a string. The returned function takes
an object as argument and executes the string as code in the context of the passed object.
The string can be any valid JavaScript code.

```js
const code = compiler.compileCode('return prop1 + prop2')
const sum = code({prop1: 1, prop2: 2}) // sum is 3
```

#### Temporary variables

The returned function also accepts a second object argument, that may contain temporary variables.
Temporary variables are added to the context object while the code is executing.
They are favored over the permanent context variables.

```js
const code = compiler.compileCode('return prop1 + prop2')
const context = {prop1: 1, prop2: 2}
const temporary = {prop1: 2}
const sum = code(context, temporary) // sum is 4, context is still {prop1: 1, prop2: 2}
```

#### Limiters

Limiters are functions, which can defer or block code execution. Some popular limiters are debounce and throttle for example. Limiters can be registered by name with `compiler.limiter(name, function)` and used at the end of the code with the `&` symbol.

```js
// next is the code or the next limiter
compiler.limiter('delay', next => setTimeout(next, 1000))

const code = compiler.compileCode('console.log(message) & delay')
const context = {message: 'Hello World'}
code(context) // prints 'Hello World' to the console after a second
```

Limiters accept a context object, which can be used to share a context between executions of the code. It makes the creation of rate limiters - like throttle and debounce - straightforward.

```js
compiler.limiter('debounce', debounce)

function debounce (next, context) {
  clearTimeout(context.timer)
  context.timer = setTimeout(next, 200)
}
```

After the context argument limiters accept any number of custom arguments. These can be passed after the limiter name in the code, separated by spaces.

```js
compiler.limiter('delay', (next, context, amount) => setTimeout(next, amount))

const code = compiler.compileCode('console.log(message) & delay 2000')
const code2 = compiler.compileCode('console.log(message) & delay amount')

const context = {message: 'Hello World', amount: 3000}
code(context) // prints 'Hello World' to the console after 2 seconds
code2(context) // prints 'Hello World' to the console after 3 seconds
```

Multiple limiters can be piped with the `&` symbol.

```js
const code = compiler.compileCode('console.log(message) & delay 1000 & throttle 100')

// this logs 'Hello World' a second after you click the button
// and it logs a message once per 100 milliseconds at most, excess messages are not logged
button.addEventListener('code', () => code({message: 'Hello World'}))
```

You can find some commonly used limiters in [this repo](https://github.com/nx-js/limiters).

### Compiling expressions

`compiler.compileExpression(string)` creates a function from a string. The returned function takes
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

#### Filters

Filters are functions, which can filter and modify expression result. Some popular filters are upperCase and trim for example. Filters can be registered by name with `compiler.filter(name, function)` and used at the end of the expression with the `|` symbol.

```js
// txt is the result of the expression
compiler.filter('upperCase', txt => txt.toUpperCase())

const expr = compiler.compileExpression('message | upperCase')
const context = {message: 'Hello World'}
console.log(expr(context)) // prints 'HELLO WORLD' to the console
```

Filters accept any number of custom arguments. These can be passed after the filter name in the expression, separated by spaces.

```js
compiler.filter('splice', (txt, start, end) => txt.splice(start, end))

const expr = compiler.compileExpression('message | splice 0 6')
const context = {message: 'Hello World'}
console.log(expr(context)) // prints 'Hello' to the console
```

Multiple filters can be piped with the `|` symbol.

```js
const expr = compiler.compileExpression('message | splice 0 6 | upperCase')
const context = {message: 'Hello World'}
console.log(expr(context)) // prints 'HELLO' to the console
```

You can find some commonly used filters in [this repo](https://github.com/nx-js/filters).

### Handling globals

`compiler.expose('String, String, ...')` exposes globals by name for the compiler. Non of the globals are exposed by default.

```js
const code = compiler.compileCode('console.log(Math.round(num))')
compiler.expose('console', 'Math')
code({num: 1.8}) // logs 2 to the console
```

Context variables are always favored over global ones, when both are present with the same name.

`compiler.hide(String, String, ...)` hides globals by name, while `compiler.hideAll()` hides all globals.

```js
const code = compiler.compileCode('console.log(Math.round(num))')
compiler.expose('console', 'Math')
code({num: 1.8}) // logs 2 to the console
compiler.hide('console', 'Math')
code({num: 1.8}) // throws an error, console and Math are undefined
```

## Alternative builds

This library detects if you use ES or commonJS modules and serve the right format to you. The exposed bundles are transpiled to ES5 to support common tools - like UglifyJS. If you would like a finer control over the provided build, you can specify them in your imports.

* `@nx-js/compiler-util/dist/es.es6.js` exposes an ES6 build with ES modules.
* `@nx-js/compiler-util/dist/es.es5.js` exposes an ES5 build with ES modules.
* `@nx-js/compiler-util/dist/cjs.es6.js` exposes an ES6 build with commonJS modules.
* `@nx-js/compiler-util/dist/cjs.es5.js` exposes an ES5 build with commonJS modules.

If you use a bundler, set up an alias for `@nx-js/compiler-util` to point to your desired build. You can learn how to do it with webpack [here](https://webpack.js.org/configuration/resolve/#resolve-alias) and with rollup [here](https://github.com/rollup/rollup-plugin-alias#usage).

## Contributions

This library has the very specific purpose of supporting the
[NX framework](https://github.com/nx-js/framework).
Features should only be added, if they are used by the framework. Otherwise please fork.

Bug fixes, tests and doc updates are always welcome.
Tests and linter (standardJS) must pass.

## Authors

  - [Miklos Bertalan](https://github.com/solkimicreb)

# License

  MIT
