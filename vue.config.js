// vue.config.js
module.exports = {
  publicPath: './',
  devServer: {
    proxy: {
      //
      '/api': {
        target: 'https://localhost:7050',
        changeOrigin: true,
        secure: false // 自簽憑證才需要 false
      },

      // Whisper 服務
      // '/whisper': {
      //   target: 'http://10.176.239.52:5001',
      //   changeOrigin: true
      // }
    }
  }
}
