// Mock de AsyncStorage para web usando localStorage
const AsyncStorage = {
  getItem: async (key) => {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      console.warn('Error getting item from localStorage:', error);
      return null;
    }
  },

  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Error setting item in localStorage:', error);
      throw error;
    }
  },

  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error removing item from localStorage:', error);
      throw error;
    }
  },

  clear: async () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
      throw error;
    }
  },

  getAllKeys: async () => {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i));
      }
      return keys;
    } catch (error) {
      console.warn('Error getting all keys from localStorage:', error);
      return [];
    }
  },

  multiGet: async (keys) => {
    try {
      const result = [];
      for (const key of keys) {
        const value = localStorage.getItem(key);
        result.push([key, value]);
      }
      return result;
    } catch (error) {
      console.warn('Error getting multiple items from localStorage:', error);
      return [];
    }
  },

  multiSet: async (keyValuePairs) => {
    try {
      for (const [key, value] of keyValuePairs) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Error setting multiple items in localStorage:', error);
      throw error;
    }
  },

  multiRemove: async (keys) => {
    try {
      for (const key of keys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Error removing multiple items from localStorage:', error);
      throw error;
    }
  },
};

// Mock para los hooks también
export const useAsyncStorage = (key) => {
  return {
    getItem: () => AsyncStorage.getItem(key),
    setItem: (value) => AsyncStorage.setItem(key, value),
    removeItem: () => AsyncStorage.removeItem(key),
  };
};

export default AsyncStorage;
