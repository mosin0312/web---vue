module.exports = {
  publicPath: './', 

  devServer: {
    proxy: {
      "/get-user-data": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/hash-password": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      '/api': {
        target: 'https://192.168.217.211:7050',//192.168.217.211之前
        changeOrigin: true,
        secure: false, // 因為是自簽 HTTPS
    },
  }
  }
};