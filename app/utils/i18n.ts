import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../public/locals/en/global.json';
import es from '../../public/locals/es/global.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    lng: 'es',
    resources: {
      en: { global: en },
      es: { global: es },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
