/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: false,
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
