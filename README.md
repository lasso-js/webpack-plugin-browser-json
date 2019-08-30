<h1 align="center">
  <!-- Logo -->
  <br/>
  webpack-plugin-browser-json
	<br/>

  <!-- Language -->
  <a href="http://typescriptlang.org">
    <img src="https://img.shields.io/badge/%3C%2F%3E-typescript-blue.svg" alt="TypeScript"/>
  </a>
  <!-- Format -->
  <a href="https://github.com/prettier/prettier">
    <img src="https://img.shields.io/badge/styled_with-prettier-ff69b4.svg" alt="Styled with prettier"/>
  </a>
  <!-- CI -->
  <a href="https://travis-ci.org/lasso-js/webpack-plugin-browser-json">
  <img src="https://img.shields.io/travis/lasso-js/webpack-plugin-browser-json.svg" alt="Build status"/>
  </a>
  <!-- Coverage -->
  <a href="https://coveralls.io/github/lasso-js/webpack-plugin-browser-json">
    <img src="https://img.shields.io/coveralls/lasso-js/webpack-plugin-browser-json.svg" alt="Test Coverage"/>
  </a>
  <!-- NPM Version -->
  <a href="https://npmjs.org/package/webpack-plugin-browser-json">
    <img src="https://img.shields.io/npm/v/webpack-plugin-browser-json.svg" alt="NPM Version"/>
  </a>
  <!-- Downloads -->
  <a href="https://npmjs.org/package/webpack-plugin-browser-json">
    <img src="https://img.shields.io/npm/dm/webpack-plugin-browser-json.svg" alt="Downloads"/>
  </a>
</h1>

A webpack plugin that allows for an additional config file for browser dependencies.
The implementation is mostly compatible with the one from [Lasso](https://github.com/lasso-js/lasso) but is missing some features.

This is primarily meant as a stop gap utility for developers incrementally migrating from Lasso to Webpack.

# Installation

```console
npm install webpack-plugin-browser-json -D
```

# Example

**webpack.config.js**

```javascript
const { BrowserJSONPlugin } = require("webpack-plugin-browser-json");

module.exports = {
  // your webpack config
  ...,
  plugins: [
    new BrowserJSONPlugin({
      flags: ["a", "b"] // Set the lasso flags for this compilation
    })
  ]
}
```

## Code of Conduct

This project adheres to the [eBay Code of Conduct](./.github/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
