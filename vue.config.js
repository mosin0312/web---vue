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
        target: 'https://localhost:7050',//主機
        changeOrigin: true,
        secure: false, // 因為是自簽 HTTPS
    },
      "/api/Test": {
        target: "http://localhost:5003",
        changeOrigin: true,
        secure: false,
        
    },
    // '/api': {
    //     target: 'https://192.168.217.211:7050',// 這裡是 nginx 的 port
    //     changeOrigin: true,
    //     secure: false, // 因為是自簽 HTTPS
    // },
  }
  }
};