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
        const forwardedHost = process.env.NEXT_PUBLIC_HOST;
        if (!forwardedHost) {
            return [];
        }
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'x-forwarded-host',
                        value: forwardedHost,
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
