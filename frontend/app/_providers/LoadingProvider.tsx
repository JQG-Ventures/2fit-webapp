'use client';

import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';

type LoadingContextType = {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    navigateWithLoading: (path: string) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const setLoading = (loading: boolean) => {
        setIsLoading(loading);
    };

    const navigateWithLoading = (path: string) => {
        setLoading(true);
        router.push(path);
    };

    return (
        <LoadingContext.Provider value={{ isLoading, setLoading, navigateWithLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = (): LoadingContextType => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};
