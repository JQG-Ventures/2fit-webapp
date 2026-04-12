'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Step0Credentials from '@/app/(auth)/register/_components/steps/Step0Credentials';
import Step1PersonalInfo from '@/app/(auth)/register/_components/steps/Step1PersonalInfo';
import Step2Gender from '@/app/(auth)/register/_components/steps/Step2Gender';
import Step3FitnessGoal from '@/app/(auth)/register/_components/steps/Step3FitnessGoal';
import Step4Height from '@/app/(auth)/register/_components/steps/Step4Height';
import Step5Weight from '@/app/(auth)/register/_components/steps/Step5Weight';
import Step6TargetWeight from '@/app/(auth)/register/_components/steps/Step6TargetWeight';
import Step7FitnessLevel from '@/app/(auth)/register/_components/steps/Step7FitnessLevel';
import Step8WorkoutTypes from '@/app/(auth)/register/_components/steps/Step8WorkoutTypes';
import Step9TrainingDays from '@/app/(auth)/register/_components/steps/Step9TrainingDays';
import Step10Submit from '@/app/(auth)/register/_components/steps/Step10Submit';

export interface StepProps {
    onNext: () => void;
    onPrev: () => void;
}

type StepComponent = React.ComponentType<StepProps> | React.ComponentType<object>;

const STEPS: StepComponent[] = [
    Step0Credentials,
    Step1PersonalInfo,
    Step2Gender,
    Step3FitnessGoal,
    Step4Height,
    Step5Weight,
    Step6TargetWeight,
    Step7FitnessLevel,
    Step8WorkoutTypes,
    Step9TrainingDays,
    Step10Submit,
];

const SUBMIT_STEP_INDEX = STEPS.length - 1;

export default function RegisterWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState<1 | -1>(1);

    const goNext = () => {
        setDirection(1);
        setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const goPrev = () => {
        setDirection(-1);
        setCurrentStep((s) => Math.max(s - 1, 0));
    };

    const progress = (currentStep / (STEPS.length - 1)) * 100;
    const isSubmitStep = currentStep === SUBMIT_STEP_INDEX;

    const StepComponent = STEPS[currentStep] as React.ComponentType<StepProps>;

    const variants = {
        enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
        center: { opacity: 1, x: 0 },
        exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
    };

    return (
        <div className="w-full min-h-svh flex flex-col bg-white">
            {!isSubmitStep && (
                <div className="w-full px-7 pt-6">
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-black rounded-full"
                            initial={false}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                        />
                    </div>
                    <p className="text-sm text-gray-400 mt-2 text-right tabular-nums">
                        {currentStep + 1} / {STEPS.length - 1}
                    </p>
                </div>
            )}

            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentStep}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="flex-1 flex flex-col px-7 pt-2 pb-8"
                >
                    <StepComponent onNext={goNext} onPrev={goPrev} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
