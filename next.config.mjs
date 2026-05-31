/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'drive.google.com', pathname: '/**' },
      { protocol: 'https', hostname: 'docs.google.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.cdninstagram.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.fbcdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'instagram.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.instagram.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },
}

export default nextConfig
