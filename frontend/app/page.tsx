'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import EmblaCarousel from './_components/carousel/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';
import { useTranslation } from 'react-i18next';

const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };

export default function RegisterStart() {
    const router = useRouter();
    const { t } = useTranslation('global');

    const IMAGES_DATA = [
        {
            id: 1,
            src: '/images/onboarding-1.jpg',
            title: t('WelcomPage.title1'),
            caption: t('WelcomPage.description1'),
        },
        {
            id: 2,
            src: '/images/onboarding-2.jpg',
            title: t('WelcomPage.title2'),
            caption: t('WelcomPage.description2'),
        },
        {
            id: 3,
            src: '/images/onboarding-3.jpg',
            title: t('WelcomPage.title3'),
            caption: t('WelcomPage.description3'),
        },
    ];
    const SLIDES = Array.from(Array(IMAGES_DATA.length).keys());

    const handleStartTraining = () => {
        router.push('/register');
    };

    return (
        <div className="min-h-screen flex flex-col bg-black">
            <div className="flex-grow h-3/4 flex flex-col justify-center items-center">
                <div className="flex justify-center items-center h-full w-full">
                    <EmblaCarousel slides={SLIDES} image_data={IMAGES_DATA} options={OPTIONS} />
                </div>
                <div className="flex flex-col items-center justify-center mt-6">
                    <button
                        onClick={handleStartTraining}
                        className="bg-white text-black py-3 px-6 rounded font-semibold my-6 focus:outline-none focus:ring-2 focus:ring-green-500"
                        aria-label="Start training process"
                    >
                        {t('WelcomPage.startbtn')}
                    </button>
                    <p className="w-full text-center text-white">
                        {t('WelcomPage.questiontxt')}?{' '}
                        <a href="/login" className="underline text-green-500">
                            {t('WelcomPage.signin')}
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
