'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import EmblaCarousel from './_components/carousel/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';

const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };
const IMAGES_DATA = [
    {
        id: 1,
        src: '/images/onboarding-1.jpg',
        title: 'Welcome to 2Fit-AI',
        caption: 'Improve your fitness with the help of the latest artificial intelligence technology.',
    },
    {
        id: 2,
        src: '/images/onboarding-2.jpg',
        title: 'Workout Categories',
        caption: 'Workout categories will help you gain strength, get in better shape and embrace a healthy lifestyle.',
    },
    {
        id: 3,
        src: '/images/onboarding-3.jpg',
        title: 'Custom Workouts',
        caption: 'With AI assistance, you can access a variety of different workout routines and save them in your app.',
    },
];
const SLIDES = Array.from(Array(IMAGES_DATA.length).keys());

export default function RegisterStart() {
    const router = useRouter();

    const handleStartTraining = () => {
        router.push('/register');
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
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
                        Start Training
                    </button>
                    <p className="w-full text-center text-white">
                        Already have an account?{" "}
                        <a href="/login" className="underline text-green-500">
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
