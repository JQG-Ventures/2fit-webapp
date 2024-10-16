'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegisterData {
    email: string,
    fitness_goal: 0,
    fitness_level: number,
    gender: number,
    height: number,
    last: string,
    name: string,
    number: string,
    password: string,
    target_weight: 0,
    weight: number,
    workout_type: []
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
    const [data, setData] = useState<RegisterData>({});

    const updateData = (newData: RegisterData) => {
        setData((prevData) => ({ ...prevData, ...newData }));
    };

    return (
        <RegisterContext.Provider value={{ data, updateData }}>
            {children}
        </RegisterContext.Provider>
    );
};
