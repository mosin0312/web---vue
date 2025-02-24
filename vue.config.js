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
      }
    }
  }
};
