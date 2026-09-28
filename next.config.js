/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode is disabled on purpose. In development it double-invokes
  // effects, and the uploader/downloader both subscribe to PeerJS events in
  // useEffect, which would create (and tear down) every peer connection twice.
  reactStrictMode: false,
  output: 'standalone',
  eslint: {
    // Linting is a separate, faster step (`pnpm lint:check`) so `next build`
    // never fails the deploy on a style nit.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
