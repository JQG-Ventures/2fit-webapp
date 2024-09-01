'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RegisterData {
    [key: string]: any;
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
