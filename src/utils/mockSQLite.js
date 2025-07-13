// Mock para react-native-sqlite-storage en web
module.exports = {
  DEBUG: () => {},
  enablePromise: () => {},
  openDatabase: () => Promise.resolve({
    executeSql: () => Promise.resolve([{ rows: { length: 0, item: () => ({}) } }]),
    close: () => Promise.resolve(),
  }),
};
