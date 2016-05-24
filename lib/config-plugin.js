var _ = require("lodash")
var path = require("path")

// Load configuration file
function loadFile(dir, filename) {
  if (filename == null) return {}
  filename = path.join(dir, filename)
  try {
    return require(filename)
  } catch(e) {
    return {}
  }
}

module.exports = Config
function Config(options) {
  this.options = options
  this._config = null

  if (this.options.environment == null) {
    this.options.environment = process.env.NODE_ENV || "development"
  }
}

Config.prototype.getConfig = function () {
  if (!this._config) {
    this._config = _.merge({},
      loadFile(this.options.dir, "default"),
      loadFile(this.options.dir, this.options.environment),
      loadFile(this.options.dir, "local")
    )
  }
  return this._config
}

Config.prototype.apply = function(compiler) {
  // Build the configuration object
  var options = this.options
  var config = this.getConfig()

  // Setup a resolver to faux-resolve a request for "config"
  compiler.resolvers.normal.plugin("module", function(request, next) {
    if (request.request !== "config") {
      // This plugin only resolves for the explicit module "config"
      return next()
    }

    return next(null, {
      // No actual source is needed here
      path: path.join(options.dir, "default.js"),
      resolved: true
    })
  })

  // Setup a module-factory to direct the flow to the loader (
  // which outputs the configuration JSON)
  compiler.plugin("normal-module-factory", function(nmf) {
    nmf.plugin("after-resolve", function(data, next) {
      if (data.rawRequest !== "config") {
        // This plugin only resolves for the explicit module "config"
        return next(null, data)
      }

      // console.log(data)
      // NOTE: Parameters are passed via query string to the loader
      //       at `this.query`
      data.loaders = [
        path.join(__dirname, "./config-loader.js") + "?" +
        JSON.stringify(config)
      ]

      return next(null, data)
    })
  })
}
