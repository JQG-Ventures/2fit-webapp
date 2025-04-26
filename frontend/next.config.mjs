/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "x-forwarded-host",
            value: process.env.NEXT_PUBLIC_HOST,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
