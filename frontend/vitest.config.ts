import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
        include: ['**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', '.next', 'coverage'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            include: [
                'app/(app)/home/**/*.ts',
                'app/(app)/home/**/*.tsx',
                'app/_components/_sections/WorkoutHeroCard.tsx',
                'app/_components/_sections/HomeStatsRow.tsx',
                'app/_components/workouts/challenges/ChallengeProgressWidget.tsx',
            ],
            exclude: [
                'app/**/*.{test,spec}.{ts,tsx}',
                'app/(app)/home/page.tsx',
                'app/**/layout.tsx',
                'app/**/loading.tsx',
                'app/**/error.tsx',
                'app/**/not-found.tsx',
                'node_modules/**',
                '.next/**',
                'coverage/**',
            ],
            thresholds: {
                lines: 90,
                functions: 90,
                statements: 90,
                branches: 88,
            },
        },
    },
});
