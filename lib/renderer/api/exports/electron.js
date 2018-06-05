const common = require('../../../common/api/exports/electron')
const moduleList = require('../module-list')

// Import common modules.
common.defineProperties(exports)

for (const module of moduleList) {
  Object.defineProperty(exports, module.name, {
    enumerable: !module.private,
    get: () => require(`../${module.file}`)
  })
}

/** Sandboxed Node **/
// For browserified sandbox injection
// TODO(SteveB): Automate generation of this list
exports.oldRequires = exports.oldRequires || {}
Object.defineProperties(exports.oldRequires, {
  // Renderer side modules, please sort with alphabet order.
  desktopCapturer: {
    enumerable: true,
    get: function () {
      return require('../desktop-capturer')
    }
  },
  ipcRenderer: {
    enumerable: true,
    get: function () {
      return require('../ipc-renderer')
    }
  },
  remote: {
    enumerable: true,
    get: function () {
      return require('../remote')
    }
  },
  screen: {
    enumerable: true,
    get: function () {
      return require('../screen')
    }
  },
  webFrame: {
    enumerable: true,
    get: function () {
      return require('../web-frame')
    }
  }
})
/*************/
