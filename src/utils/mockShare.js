// Mock para react-native-share en web
module.exports = {
  default: {
    share: (options) => {
      // En web, usamos la Web Share API si está disponible
      if (navigator.share) {
        return navigator.share({
          title: options.title,
          text: options.message,
          url: options.url,
        });
      } else {
        // Fallback: crear un enlace de descarga
        const blob = new Blob([options.message || ''], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = options.filename || 'data.txt';
        a.click();
        URL.revokeObjectURL(url);
        return Promise.resolve();
      }
    },
  },
};
