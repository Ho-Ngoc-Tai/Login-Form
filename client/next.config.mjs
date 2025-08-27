/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000'
        // pathname: '/photos/**'
      }
    ]
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  }
}

export default nextConfig
