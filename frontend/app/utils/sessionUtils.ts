'use client';

import { signOut } from 'next-auth/react';

export async function logout() {
    try {
        await signOut({ callbackUrl: '/', redirect: true });
    } catch (error) {
        console.error('Failed to log out:', error);
    }
}
