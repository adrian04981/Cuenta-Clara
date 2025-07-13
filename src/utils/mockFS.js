// Mock para react-native-fs en web
module.exports = {
  DocumentDirectoryPath: '/documents',
  writeFile: () => Promise.resolve(),
  readFile: () => Promise.resolve(''),
  exists: () => Promise.resolve(false),
};
