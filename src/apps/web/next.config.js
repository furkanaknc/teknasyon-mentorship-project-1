/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@teknasyon/configs",
    "@teknasyon/interfaces",
    "@teknasyon/models",
  ],
};

module.exports = nextConfig;
