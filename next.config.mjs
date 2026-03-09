/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'platform-lookaside.fbsbx.com',
            },
            {
                protocol: 'https',
                hostname: '**.muscache.com',
            },
        ],
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals.push('node-ical');
        }
        return config;
    },
};

export default nextConfig;
