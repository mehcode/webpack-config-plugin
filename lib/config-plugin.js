const assert = require('assert');
const path = require('path');
const merge = require('lodash/merge');

class Config {

  // Load configuration file.
  // Fails gracefully by returning an empty object.
  static loadConfigFile(dir, filename) {
    if (!filename) {
      return {};
    }

    try {
      const pathname = path.resolve(dir, filename);

      return require(pathname);
    } catch (error) {
      return {};
    }
  }

  constructor(options = {}) {
    assert(typeof options.dir === 'string', 'WebpackConfigPlugin: "options.dir" must be provided');
    assert(!options.filter || Array.isArray(options.filter), 'WebpackConfigPlugin: "options.filter" must be an array. See "json-property-filter" package for more details');

    this.options = options;
    this.config = null;

    if (!this.options.environment) {
      this.options.environment = process.env.NODE_ENV || 'development';
    }
  }

  getConfig() {
    if (!this.config) {
      const { dir, environment } = this.options;

      this.config = merge(
        {},
        Config.loadConfigFile(dir, 'default'),
        Config.loadConfigFile(dir, environment),
        Config.loadConfigFile(dir, 'local')
      );
    }

    return this.config;
  }

  apply(compiler) {

    // Build the configuration object
    const config = this.getConfig();

    compiler.plugin('compilation', compilation => {

      // Setup a resolver to faux-resolve a request for "config"
      compilation.resolvers.normal.plugin('module', (request, next) => {
        if (request.request !== 'config') {

          // This plugin only resolves for the explicit module "config"
          return next();
        }

        return next(null, {

          // This path is not actually used but must be set to a real file
          path: 'package.json',
          resolved: true
        });
      });
    });

    // Setup a module-factory to direct the flow to the loader (
    // which outputs the configuration JSON)
    compiler.plugin('normal-module-factory', factory => {
      factory.plugin('after-resolve', (data, next) => {
        if (data.rawRequest !== 'config') {

          // This plugin only resolves for the explicit module "config"
          return next(null, data);
        }

        const { filter } = this.options;
        const loaderPathname = path.resolve(__dirname, 'config-loader.js');
        const loaderQuery = {
          config,
          filter
        };

        // NOTE: Parameters are passed via query string to the loader
        //       at `this.query`
        data.loaders = [
          `${loaderPathname}?${JSON.stringify(loaderQuery)}`
        ];

        return next(null, data);
      });
    });
  }
}

module.exports = Config;