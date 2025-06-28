// src/api/index.js
import axios from 'axios';

const instance = axios.create({
  baseURL: '/', // 保持 base 為 '/'，使用 vue.config.js 中的 proxy
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
