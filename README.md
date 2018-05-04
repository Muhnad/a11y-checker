# a11y checker
> Identifies accessibility issues in HTML markup.


## Install

```bash
npm install --save a11y-checker
```

## Usage

- Import a11yChecker
```js
import a11yChecker from 'a11y-checker';
```

- Call it after page loads:
```js
a11yChecker();
```

## Live Examples
- [JS Live Example](https://oozqxkw1lz.codesandbox.io/)
- [JS Code Example](https://codesandbox.io/s/oozqxkw1lz)
- [React Live Example](https://9yly237pkr.codesandbox.io/)
- [React Code Example](https://codesandbox.io/s/9yly237pkr)

## Contribute
* clone project
  ```bash
  git clone git@github.com:Muhnad/a11y-checker.git
  ```
* `cd a11y-checker/`
* `npm i`
* `npm start` to run eslint on watch mode and server at localhost:8080.
* `npm run build` to generate a minified, production-ready build.

## Files structure
- src: for development files.
  - head: for check everything happens inside `<head>`
  - body: for check everything happens inside `<body>`

## Rules
[Docs](https://github.com/Muhnad/a11y-checker/tree/master/docs)
