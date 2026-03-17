'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { RegisterDraft } from '@/app/_types/register';
import { createInitialRegisterData } from '@/app/utils/register';

interface RegisterContextType {
    data: RegisterDraft;
    updateData: (newData: RegisterDraft) => void;
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
    const [data, setData] = useState<RegisterDraft>(createInitialRegisterData());

    const updateData = (newData: RegisterDraft) => {
        setData((prevData) => ({ ...prevData, ...newData }));
    };

    return (
        <RegisterContext.Provider value={{ data, updateData }}>{children}</RegisterContext.Provider>
    );
};
