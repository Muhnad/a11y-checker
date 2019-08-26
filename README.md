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
- [Vue Live Example](https://4jr02o9ln9.codesandbox.io/)
- [Vue Code Example](https://codesandbox.io/s/4jr02o9ln9)




## Contributing

> Hey there! Thanks for your interest in helping out. If you happen to
> run into any issues, please
> [open an issue](https://github.com/Muhnad/a11y-checker/issues/new/choose),
> and I'll do my best to help out.

To begin contributing, you'll first need to
[clone this repository](https://help.github.com/articles/cloning-a-repository/),
then navigate into the repository's directory.

```
git clone git@github.com:{{ YOUR_USERNAME }}/a11y-checker.git

cd a11y-checker/
```

Next, install the dependencies using [npm](https://www.npmjs.com/).

```
npm install
```
Great! – you're ready to contribute!

Create git branch
```
git checkout -b BRANCH_NAME_HERE
```

Run code locally. To do that, execute the start command:

commands        | Description
--------------- | ----------
`npm start`     | Run project locally on port=8080.
`npm build`     | Generate a minified, production-ready build.


## Files structure
Folder        | Description
--------------- | ----------
src     | for development files.
head     | for check everything happens inside `<head>`
body     | for check everything happens inside `<body>`


## Rules
[Docs](https://github.com/Muhnad/a11y-checker/tree/master/docs)

## Tools
there's a lot of a11y linters and tools that work and maintained better than A11y-Checker.

Tools        | Description
--------------- | ----------
[eslint-jsx](https://github.com/evcohen/eslint-plugin-jsx-a11y) | Static AST checker for a11y rules on JSX elements.
[axe-core](https://github.com/dequelabs/axe-core) | Generate a minified, production-ready build.
[ally.js](https://github.com/medialize/ally.js) | JavaScript library to help modern web applications with accessibility concerns
[Awesome-a11y-validators](https://github.com/brunopulis/awesome-a11y/blob/master/topics/validators.md) | List of development Testing and Validators tools.

That's All. Thanks.
