"use client"; // Asegúrate de que esto esté presente

import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';
import React, { useState } from 'react';
import { useTranslation } from 'next-i18next'; // Importa el hook de traducción
import { useLanguage } from '../../utils/LanguageContext'; // Asegúrate de la ruta correcta
import i18n from 'i18next'; // Asegúrate de importar i18n

const Settings: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('global'); // Usa el namespace 'global'
  const { language, setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es'>(language as 'en' | 'es');

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value as 'en' | 'es');
  };

  const handleSave = () => {
    console.log("Language before change:", language); // Verifica el idioma actual
    setLanguage(selectedLanguage); // Cambia el idioma en el contexto
    i18n.changeLanguage(selectedLanguage); // Cambia el idioma en i18next
  };

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-10 md:pt-32">
      <header className="flex justify-between items-center mb-8">
      <button onClick={() => router.back()} className="text-gray-700">
          <FaArrowLeft className="w-8 h-8" />
        </button>
        <h1 className="text-4xl font-bold flex-grow text-center">{t('settings')}</h1>
      </header>

      <div className="space-y-6 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold">{t('accountSettings')}</h2>
          <div className="flex items-center mt-4 py-4">
            <label htmlFor="language" className="mr-4 text-2xl">{t('language')}</label>
            <select 
              id="language"
              value={selectedLanguage} 
              onChange={handleLanguageChange} 
              className="border border-gray-300 rounded-md p-2"
            >
              <option value="en">ENG</option>
              <option value="es">ES</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-green-400 to-green-700 text-white p-4 rounded-full text-2xl font-semibold shadow-lg py-8"
      >
        {t('save')}
      </button>
    </div>
  );
};

export default Settings;
