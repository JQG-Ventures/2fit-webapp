// frontend/app/_components/notifications/OneSignalInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRegisterPlayerId } from '@/app/_services/userService';
import { initializeOneSignal } from '@/app/_services/initOnesignal';

interface AppSession {
    user?: {
        token?: string | null;
    };
}

const OneSignalInitializer = () => {
    const { data: sessionData, status } = useSession();
    const session = sessionData as AppSession | null;
    const { mutateAsync: registerOneSignalPlayerId } = useRegisterPlayerId();
    const token = session?.user?.token ?? null;

    useEffect(() => {
        if (!token || status !== 'authenticated') return;

        const run = async () => {
            await initializeOneSignal(token, async (playerId) => {
                await registerOneSignalPlayerId({
                    body: {
                        player_id: playerId,
                        platform: 'web',
                    },
                });
            });
        };

        void run();
    }, [token, status, registerOneSignalPlayerId]);

    return null;
};

export default OneSignalInitializer;
