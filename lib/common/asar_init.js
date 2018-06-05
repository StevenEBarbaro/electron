;(function () {
  return function (process, require, asarSource, sandboxHelperSource) {
    // Remove browserify shims and rely on node
    const reNodeifyReplaceMap = {
      'const {Buffer} = require(\'buffer\')': '',
      'var process = module.exports = {};': '',
      'require(\'_process\')': 'global.process',
      'const {ipcRenderer, isPromise, CallbacksRegistry} = require(\'electron\')': 'const {ipcRenderer, isPromise, CallbacksRegistry} = electronRenderer'
    }

    function escapeRegExp (string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    }

    var re = new RegExp(Object.keys(reNodeifyReplaceMap).map((element) => escapeRegExp(element)).join('|'), 'gi')

    let updatedSandboxSource = ''

    try {
      updatedSandboxSource = sandboxHelperSource.replace(re, function (match) {
        return reNodeifyReplaceMap[match]
      })
    } catch (e) {
    }

    const sandboxHelperModule = `
(function () {
    const originalRequire = global.require;
    global.require = undefined;
    let sandboxHelper = {};
  
    (function () {
        ${updatedSandboxSource}
    })();

    global.require = originalRequire;
    module.exports = sandboxHelper;
})()`

    // Make the sandbox helper accessible via "require".
    process.binding('natives').SANDBOX_HELPER = sandboxHelperModule

    // Make asar.js accessible via "require".
    process.binding('natives').ELECTRON_ASAR = asarSource

    // Monkey-patch the fs module.
    require('ELECTRON_ASAR').wrapFsWithAsar(require('fs'))

    // Make graceful-fs work with asar.
    var source = process.binding('natives')
    source['original-fs'] = source.fs
    source['fs'] = `
var nativeModule = new process.NativeModule('original-fs')
nativeModule.cache()
nativeModule.compile()
var asar = require('ELECTRON_ASAR')
asar.wrapFsWithAsar(nativeModule.exports)
module.exports = nativeModule.exports`
  }
})()
