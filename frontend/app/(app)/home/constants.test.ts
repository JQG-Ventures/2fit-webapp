import { describe, expect, it } from 'vitest';

import {
    HOME_BY_LEVEL_CARD_LIMIT,
    HOME_DESKTOP_MIN_WIDTH_PX,
    HOME_EXPLORE_CARD_LIMIT,
    HOME_MOBILE_BOTTOM_NAV_PADDING_CLASS,
} from './constants';

describe('home constants', () => {
    it('exports expected numeric layout values', () => {
        expect(HOME_DESKTOP_MIN_WIDTH_PX).toBe(1224);
        expect(HOME_EXPLORE_CARD_LIMIT).toBe(6);
        expect(HOME_BY_LEVEL_CARD_LIMIT).toBe(3);
    });

    it('exports mobile nav padding class token', () => {
        expect(HOME_MOBILE_BOTTOM_NAV_PADDING_CLASS).toBe('pb-[110px]');
    });
});
