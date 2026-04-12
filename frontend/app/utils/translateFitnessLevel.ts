type TranslateFn = (key: string) => string;

/**
 * Normalizes API difficulty strings (any casing, common typos) to canonical keys.
 */
export function normalizeFitnessLevel(raw: string): string {
    const s = raw
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_');

    if (['begginner', 'begginer', 'beginers', 'beginners'].includes(s)) {
        return 'beginner';
    }
    if (s === 'inter_mediate' || s === 'intermidiate') {
        return 'intermediate';
    }
    if (s === 'advance' || s === 'adv') {
        return 'advanced';
    }
    return s;
}

/**
 * Maps backend difficulty / level to `home.discovery.level*` i18n labels.
 * Unknown values are returned as-is for debugging.
 */
export function translateFitnessLevel(raw: string | null | undefined, t: TranslateFn): string {
    if (raw == null || !String(raw).trim()) {
        return t('home.workoutHero.defaultDifficulty');
    }
    const n = normalizeFitnessLevel(String(raw));
    if (n === 'beginner') return t('home.discovery.levelBeginner');
    if (n === 'intermediate') return t('home.discovery.levelIntermediate');
    if (n === 'advanced') return t('home.discovery.levelAdvanced');
    return String(raw).trim();
}
