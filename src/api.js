import axios from 'axios';
import router from '@/router'

const instance = axios.create({
  baseURL: '/', // 使用 vue.config.js 的 proxy 設定
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 加入攔截器：處理 JWT 過期或使用者狀態為登出
instance.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    const userStatus = error.response?.data?.userStatus

    if (status === 401 || userStatus === 'Logout') {
      // 清除所有登入資訊
      localStorage.removeItem('userToken')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('nickname')
      localStorage.removeItem('accountName')

      // 自動導向登入頁（附上提示參數）
      router.push({ path: '/', query: { loggedOut: 'true' } })
    }

    return Promise.reject(error)
  }
)

export default instance