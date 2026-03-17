import type { NextConfig } from 'next';
import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
