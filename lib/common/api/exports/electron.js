const moduleList = require('../module-list')

// Attaches properties to |exports|.
exports.defineProperties = function (exports) {
  const descriptors = {}
  for (const module of moduleList) {
    descriptors[module.name] = {
      enumerable: !module.private,
      get: () => require(`../${module.file}`)
    }
  }

  /** Sandboxed Node **/
  // For browserified sandbox injection
  // TODO(SteveB): Automate generation of this list
  exports.oldRequires = exports.oldRequires || {}
  Object.defineProperties(exports.oldRequires, {
    // Common modules, please sort with alphabet order.
    clipboard: {
      // Must be enumerable, otherwise it woulde be invisible to remote module.
      enumerable: true,
      get: function () {
        return require('../clipboard')
      }
    },
    crashReporter: {
      enumerable: true,
      get: function () {
        return require('../crash-reporter')
      }
    },
    nativeImage: {
      enumerable: true,
      get: function () {
        return require('../native-image')
      }
    },
    shell: {
      enumerable: true,
      get: function () {
        return require('../shell')
      }
    },

    // The internal modules, invisible unless you know their names.
    CallbacksRegistry: {
      get: function () {
        return require('../callbacks-registry')
      }
    },
    deprecate: {
      get: function () {
        return require('../deprecate')
      }
    },
    deprecations: {
      get: function () {
        return require('../deprecations')
      }
    },
    isPromise: {
      get: function () {
        return require('../is-promise')
      }
    }
  })
  /*************/

  return Object.defineProperties(exports, descriptors)
}
