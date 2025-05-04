'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegisterData {
    email: string;
    fitness_goal: string;
    fitness_level: string;
    gender: string;
    height: number;
    last: string;
    name: string;
    number: string;
    password: string;
    training_days_per_week: string[];
    target_weight: 0;
    weight: number;
    workout_type: string[];
    auth_provider: string;
}

interface RegisterContextType {
    data: RegisterData;
    updateData: (newData: RegisterData) => void;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

export const useRegister = () => {
    const context = useContext(RegisterContext);
    if (!context) {
        throw new Error('useRegister must be used within a RegisterProvider');
    }
    return context;
};

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<RegisterData>({} as RegisterData);

    const updateData = (newData: RegisterData) => {
        setData((prevData) => ({ ...prevData, ...newData }));
    };

    return (
        <RegisterContext.Provider value={{ data, updateData }}>{children}</RegisterContext.Provider>
    );
};
