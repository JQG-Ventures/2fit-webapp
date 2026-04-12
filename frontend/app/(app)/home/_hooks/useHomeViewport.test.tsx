import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { HOME_DESKTOP_MIN_WIDTH_PX } from '@/app/(app)/home/constants';

import { useHomeViewport } from './useHomeViewport';

describe('useHomeViewport', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: HOME_DESKTOP_MIN_WIDTH_PX + 100,
        });
    });

    it('sets mounted and desktop flag after effect from wide viewport', async () => {
        const { result } = renderHook(() => useHomeViewport());

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.mounted).toBe(true);
        expect(result.current.isDesktopOrLaptop).toBe(true);
    });

    it('updates isDesktopOrLaptop on window resize', async () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: HOME_DESKTOP_MIN_WIDTH_PX + 50,
        });

        const { result } = renderHook(() => useHomeViewport());

        await act(async () => {
            await Promise.resolve();
        });
        expect(result.current.isDesktopOrLaptop).toBe(true);

        await act(async () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: HOME_DESKTOP_MIN_WIDTH_PX - 1,
            });
            window.dispatchEvent(new Event('resize'));
        });

        expect(result.current.isDesktopOrLaptop).toBe(false);
    });
});
