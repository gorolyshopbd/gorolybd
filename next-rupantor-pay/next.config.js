module.exports = {
  reactStrictMode: true,
  swcMinify: true,
// Removed experimental.appDir as it is now default in Next.js 13+
  env: {
    NEXT_PUBLIC_RUPANTOR_API_KEY: process.env.NEXT_PUBLIC_RUPANTOR_API_KEY,
    NEXT_PUBLIC_RUPANTOR_CLIENT_ID: process.env.NEXT_PUBLIC_RUPANTOR_CLIENT_ID
  }
};
