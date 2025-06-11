module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,json}'
  ],
  swSrc: 'src/service-worker.js',   // ← points at our source SW
  swDest: 'build/service-worker.js',
  skipWaiting: true,
  clientsClaim: true,
};
