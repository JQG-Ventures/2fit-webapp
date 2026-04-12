'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation('global');
    const year = new Date().getFullYear();

    return (
        <footer className="flex flex-col items-center justify-center p-4 bg-gray-800 text-white text-center">
            <div className="w-full md:w-auto">
                <p className="text-sm">{t('home.footer.copyright', { year })}</p>
            </div>

            <div className="mt-2">
                <p className="text-xs">{t('home.footer.poweredBy')}</p>
            </div>
        </footer>
    );
};

export default Footer;
