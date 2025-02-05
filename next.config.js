const path = require("path");

module.exports = {
  webpack(config) {
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/:path*', // 匹配静态文件路径
      },
    ];
  },
};