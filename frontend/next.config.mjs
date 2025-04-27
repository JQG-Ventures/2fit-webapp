/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    typescript: { ignoreBuildErrors: true },
    reactStrictMode: true,
    experimental: {
        appDir: true,
        // No static export expected
    },
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
