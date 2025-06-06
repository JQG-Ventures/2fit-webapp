import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
        './node_modules/swiper/**/*.{js,css,map,mjs,ts,less,scss,}',
    ],
    safelist: [
        'swiper',
        'swiper-container',
        'swiper-pagination',
        'swiper-slide',
        'swiper-wrapper',
        'swiper-pagination-bullet',
        'swiper-pagination-bullet-active',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    darkMode: 'class',
    plugins: [nextui(), require('tailwind-scrollbar')],
};
export default config;
