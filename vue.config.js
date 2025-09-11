// vue.config.js
module.exports = {
  publicPath: './',
  devServer: {
    proxy: {
      // Python 小服務
      '/get-user-data': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },
      '/hash-password': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true
      },

      // 其他 /api* 走 https://localhost:7050
      '/api': {
        target: 'https://localhost:7050',
        changeOrigin: true,
        secure: false // 自簽憑證才需要 false
      },
    }
  }
}
