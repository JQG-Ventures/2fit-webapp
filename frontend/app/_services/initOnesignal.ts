declare global {
    interface OneSignalApi {
        initialized?: boolean;
        _initCalled?: boolean;
        init(config: { appId: string; allowLocalhostAsSecureOrigin: boolean }): void;
        push(callback: () => void | Promise<void>): void;
        getNotificationPermission(): Promise<string>;
        showSlidedownPrompt(): Promise<void>;
        getUserId(): Promise<string | null>;
    }

    interface Window {
        OneSignal: OneSignalApi;
        OneSignalInitialized?: boolean;
    }
}

const loadOneSignalScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof document === 'undefined') return resolve();

        if (document.getElementById('onesignal-sdk')) return resolve();

        const script = document.createElement('script');
        script.id = 'onesignal-sdk';
        script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (err) => {
            console.error('[OneSignal] SDK load failed', err);
            reject(err);
        };
        document.head.appendChild(script);
    });
};

export const initializeOneSignal = async (
    token: string,
    onPlayerIdDetected: (playerId: string) => Promise<void>,
) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (window.OneSignalInitialized) return;

    await loadOneSignalScript();

    if (!window.OneSignal || typeof window.OneSignal !== 'function') {
        window.OneSignal = (window.OneSignal || []) as unknown as OneSignalApi;
    }

    await new Promise<void>((resolve) => {
        window.OneSignal.push(() => {
            const initialized = window.OneSignal.initialized || window.OneSignal._initCalled;
            if (!initialized) {
                window.OneSignal.init({
                    appId: '77a030b0-4205-4dcd-ba13-75becd4f846e',
                    allowLocalhostAsSecureOrigin: true,
                });
            }
            resolve();
        });
    });

    window.OneSignalInitialized = true;

    window.OneSignal.push(async () => {
        const permission = await window.OneSignal.getNotificationPermission();

        if (permission !== 'granted') {
            await window.OneSignal.showSlidedownPrompt();
        }

        const playerId = await window.OneSignal.getUserId();
        if (playerId && token) {
            await onPlayerIdDetected(playerId);
        }
    });
};
