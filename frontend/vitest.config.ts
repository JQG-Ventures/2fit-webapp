import path from 'path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

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
            include: ['app/**/*.{ts,tsx}', 'actions/**/*.{ts,tsx}'],
            exclude: [
                'app/**/*.{test,spec}.{ts,tsx}',
                'app/**/layout.tsx',
                'app/**/loading.tsx',
                'app/**/error.tsx',
                'app/**/not-found.tsx',
                'node_modules/**',
                '.next/**',
                'coverage/**',
            ],
            // Uncomment when tests are written to enforce the 90% threshold:
            // thresholds: {
            //     lines: 90,
            //     functions: 90,
            //     branches: 90,
            //     statements: 90,
            // },
        },
    },
})
