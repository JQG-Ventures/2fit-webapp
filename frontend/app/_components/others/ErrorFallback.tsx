'use client';

import React, { useCallback } from 'react';
import Modal from '@/app/_components/profile/modal';

export function ErrorFallback({ error: _error }: { error: Error }) {
    const handleClose = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    }, []);

    return (
        <Modal
            title="Error"
            message="Hubo un problema al cargar los datos. Inténtalo más tarde."
            onClose={handleClose}
        />
    );
}
