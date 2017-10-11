# webpack-config-plugin
Configuration plugin (in the style of node-config) for webpack.

## Install

```
npm install --save-dev webpack-config-plugin
```

## Configuration

```js
// webpack.config.js
var path = require('path');
var ConfigPlugin = require('webpack-config-plugin');

module.exports = {
  // [...]
  plugins: [
    // [...]
    new ConfigPlugin({

      // Configuration directory (required)
      dir: path.join(__dirname, 'config'),

      // Filter expression(s) (optional)
      filter: [ '-secret.property' ]
    })
  ]
}
```

## Usage

When the plugin has been configured it enables a faux-module `config` which
is a merge between a default configuration, an environment-specific
configuration, and a local configuration.

Please see [json-property-filter](https://www.npmjs.com/package/json-property-filter)
for documentation of filter expressions.
