const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'], // Asegúrate de que esto sea un array
  },
  localePath: path.resolve('./public/locals'), // Ruta a los archivos de traducción
};
