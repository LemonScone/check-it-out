const fs = require('fs');
const path = require('path');
const fileIcon = require('extract-file-icon');

const getAppIconBuffer = (filePath) => {
  const iconBuffer = fileIcon(filePath, 32);
  return iconBuffer;
};

const storeAppIcon = (appName, filePath) => {
  const pathToAsset = path.join(__dirname, `../assets/images/${appName}.png`);
  if (fs.existsSync(pathToAsset)) {
    return;
  }

  const iconBuffer = getAppIconBuffer(filePath);
  fs.writeFileSync(pathToAsset, iconBuffer);
};

module.exports = {
  storeAppIcon,
};
