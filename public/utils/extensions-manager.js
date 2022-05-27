const devtoolsInstaller = require('electron-devtools-installer');

class ExtensionsManager {
  async init() {
    const extensions = ['REACT_DEVELOPER_TOOLS'];

    return Promise.all(
      extensions.map((name) => devtoolsInstaller.default(devtoolsInstaller[name])),
    );
  }
}

module.exports.extensionsManager = new ExtensionsManager();
