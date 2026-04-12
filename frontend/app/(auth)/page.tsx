'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

const SLIDES = [
    {
        src: '/images/onboarding-1.jpg',
        titleKey: 'WelcomPage.title1',
        captionKey: 'WelcomPage.description1',
    },
    {
        src: '/images/onboarding-2.jpg',
        titleKey: 'WelcomPage.title2',
        captionKey: 'WelcomPage.description2',
    },
    {
        src: '/images/onboarding-3.jpg',
        titleKey: 'WelcomPage.title3',
        captionKey: 'WelcomPage.description3',
    },
];

export default function LandingPage() {
    const { t } = useTranslation('global');
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleNext = () => setCurrentSlide((s) => (s + 1) % SLIDES.length);
    const handleDot = (i: number) => setCurrentSlide(i);

    const slide = SLIDES[currentSlide];

    return (
        <div className="relative flex flex-col min-h-screen bg-black overflow-hidden">
            {/* Background image */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={slide.src}
                        alt={t(slide.titleKey)}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Top — tap zone to advance */}
                <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1"
                    aria-label="Next slide"
                />

                {/* Bottom — text + CTAs */}
                <div className="w-full max-w-lg mx-auto px-6 pb-12 pt-6">
                    {/* Dot indicators */}
                    <div className="flex justify-center gap-2 mb-6">
                        {SLIDES.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleDot(i)}
                                aria-label={`Slide ${i + 1}`}
                                className={`rounded-full transition-all duration-300 ${
                                    i === currentSlide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Slide text */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.35 }}
                            className="mb-14"
                        >
                            <h1 className="text-6xl sm:text-6xl font-bold text-white leading-tight mb-3 text-center">
                                {t(slide.titleKey)}
                            </h1>
                            <p className="text-white/70 text-[14px] leading-relaxed text-center">
                                {t(slide.captionKey)}
                            </p>
                        </motion.div>
                    </AnimatePresence>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/register')}
                            className="w-full bg-white text-black py-[18px] rounded-full font-semibold text-[17px] hover:bg-gray-100 active:scale-[0.98] transition-all duration-150"
                        >
                            {t('WelcomPage.startbtn')}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="w-full bg-transparent text-white py-[18px] rounded-full font-semibold text-[17px] border border-white/40 hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
                        >
                            {t('WelcomPage.signin')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
