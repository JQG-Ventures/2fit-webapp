// frontend/app/_components/notifications/OneSignalInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRegisterPlayerId } from '../../_services/userService';
import { initializeOneSignal } from '../../_services/initOnesignal';

const OneSignalInitializer = () => {
    const { data: session, status } = useSession();
    const { mutateAsync: registerOneSignalPlayerId } = useRegisterPlayerId();
    // @ts-ignore
    const token = session?.user?.token;

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

        run();
    }, [token, status, registerOneSignalPlayerId]);

    return null;
};

export default OneSignalInitializer;
