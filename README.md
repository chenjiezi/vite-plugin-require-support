<br>
<h2 align="center">vite-plugin-require-support</h2>
<br>

A vite plugin supports the use of `require syntax` in vite.

```
- const foo = require('bar')
+ import hash_bar from 'bar'
+ const foo = hash_bar
```


## Usage

```
npm install -D vite-plugin-require-support
```

```
// vite.config.(t|j)s

import { defineConfig } from 'vite';

import requireSupport from 'vite-plugin-require-support';

export default defineConfig({
  plugins: [
    requireSupport({
      filters: /.ts$|.js$|.tsx$|.vue$/
    })
  ],
});
```

## Doing
- [ ] ModuleVariable need to generate hash.
- [ ] Optimize import mode.

## Design

```
- const foo = require('./a/b/foo.js')
+ import Xs02j_foo from './a/b/foo.js'
+ const foo = Xs02j_foo
```

### Appointment

#### `requirePath`

- `'./a/b/foo.js'` regard as `requirePath`

- `requirePath` = `path` + `module ID` + `suffix` eg: `./a/b/` + `foo` + `js`

- `requirePath` have two shapes: `string literal` and `template literal`

#### `moduleVariable`

- `Xs02j_foo` regard as `moduleVariable`

- `moduleVariable` = `hash` + `_` + `originVariable` eg: `Xs02j` + `_` + `foo`

### Reason

- `requirePath` = `path` + `module ID` + `suffix`

  - when there are multiple module requests with similar appearance, the design is more flexible to distinguish different module request paths.

  - comparison algorithm priority of module request path: `module ID` > `suffix` > `path`

  ```
  const img1 = require('./a/b/foo.png')
  const img2 = require('./a/s/foo.png')
  const img2 = require('./a/b/foo.jpg')
  ```

- `requirePath` have two shapes: `string literal` and `template literal`

  ```
  const foo = require('foo') // string literal
  const a = 'bar'
  const zoo = require(`${a}/b/c/zoo`) // template literal
  ```

- `moduleVariable` = `hash` + `_` + `originVariable`

  - because variable `moduleVariable` is generated internally by the plugin, in order to prevent the generated variable from conflicting with the variable declared by the user, I add `hash` to variable.( or Symbol?)


- export mode transform
  
  ```
    // case1
    - const foo = require('foo')
    - const bar = require('foo').fn
    + import SDWS_foo, { fn as SDC_foo_fn } from 'foo'
    + const foo = SDWS_foo
    + const bar = SDC_foo_fn

    // case2
    - const a = require('foo').a
    - const b = require('foo').b
    + import { a as SDC_foo_a, b as SKDsk_foo_b } from 'foo'
    + const a = SDC_foo_a
    + const b = SKDsk_foo_b
  ```

## Git Contribution submission specification

> reference [vue](https://github.com/vuejs/vue/blob/dev/.github/COMMIT_CONVENTION.md) specification ([Angular](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular))

- `feat` Add new features
- `fix` Fix the problem/BUG
- `style` The code style is related and does not affect the running result
- `perf` Optimization/performance improvement
- `refactor` Refactor
- `revert` Undo edit
- `test` Test related
- `docs` Documentation/notes
- `chore` Dependency update/scaffolding configuration modification etc.
- `workflow` Workflow improvements
- `ci` Continuous integration
- `types` Type definition file changes
- `wip` In development

## License

[MIT](./LICENSE) License &copy; 2022-PRESENT [德鲁叔叔](https://github.com/chenjiezi)
