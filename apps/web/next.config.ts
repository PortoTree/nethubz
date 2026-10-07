import path from 'path';
import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    outputFileTracingRoot: path.join(__dirname, "../../"),
  },
};

export default withNextIntl(nextConfig);
