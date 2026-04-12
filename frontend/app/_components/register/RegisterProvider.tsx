'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { RegisterDraft } from '@/app/_types/register';
import { createInitialRegisterData } from '@/app/utils/register';

const STORAGE_KEY = '2fit_register_draft';

interface RegisterContextType {
    data: RegisterDraft;
    updateData: (newData: Partial<RegisterDraft>) => void;
    clearData: () => void;
}

const RegisterContext = createContext<RegisterContextType | undefined>(undefined);

export const useRegister = () => {
    const context = useContext(RegisterContext);
    if (!context) throw new Error('useRegister must be used within a RegisterProvider');
    return context;
};

const loadFromStorage = (): RegisterDraft => {
    if (typeof window === 'undefined') return createInitialRegisterData();
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as RegisterDraft) : createInitialRegisterData();
    } catch {
        return createInitialRegisterData();
    }
};

const saveToStorage = (data: RegisterDraft) => {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
        // sessionStorage not available; fail silently
    }
};

export const RegisterProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<RegisterDraft>(createInitialRegisterData);

    useEffect(() => {
        setData(loadFromStorage());
    }, []);

    const updateData = (newData: Partial<RegisterDraft>) => {
        setData((prev) => {
            const updated = { ...prev, ...newData };
            saveToStorage(updated);
            return updated;
        });
    };

    const clearData = () => {
        const fresh = createInitialRegisterData();
        setData(fresh);
        if (typeof window !== 'undefined') sessionStorage.removeItem(STORAGE_KEY);
    };

    return (
        <RegisterContext.Provider value={{ data, updateData, clearData }}>
            {children}
        </RegisterContext.Provider>
    );
};
