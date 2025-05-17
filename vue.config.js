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
      "/api": {
        target: "http://192.168.118.64:5000/",
        changeOrigin: true,
        secure: false,
      },
    }
  }
};
