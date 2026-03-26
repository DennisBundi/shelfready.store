/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@huggingface/inference", "@google/genai"],
  },
};

export default nextConfig;
