module.exports = {
  devServer: {
    proxy: {
      "/get-user-data": {
        target: "http://127.0.0.1:8000", // FastAPI 伺服器
        changeOrigin: true,
      },
      "/hash-password": {
        target: "http://127.0.0.1:8000", // FastAPI 伺服器
        changeOrigin: true,
      },
      "/api": {
        target: "http://192.168.118.64:5000/",  // ASP.NET Core API 服務的網址
        changeOrigin: true,
        secure: false
      }
    }
  }
};
