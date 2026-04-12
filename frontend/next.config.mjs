import nextI18NextConfig from './next-i18next.config.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n: nextI18NextConfig.i18n,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '2fitcontentstorage.blob.core.windows.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
                pathname: '/**',
            },
        ],
    },
    output: 'standalone',
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'x-forwarded-host',
                        value: process.env.NEXT_PUBLIC_HOST,
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
