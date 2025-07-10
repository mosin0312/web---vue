import axios from 'axios'
import router from '@/router'

const instance = axios.create({
  baseURL: '/', // 使用 vue.config.js 的 proxy 設定
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

//  每次請求都自動加上 token
instance.interceptors.request.use(config => {
  const token =
    localStorage.getItem('userToken') ||
    localStorage.getItem('guestToken') ||
    localStorage.getItem('authToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}, error => Promise.reject(error))

// 統一處理 token 過期 / 被後端判定為 Logout
instance.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    const userStatus = error.response?.data?.userStatus

    if (status === 401 || userStatus === 'Logout') {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('nickname')
      localStorage.removeItem('accountName')
      localStorage.removeItem('userRole')

      router.push({ path: '/', query: { loggedOut: 'true' } })
    }

    return Promise.reject(error)
  }
)

export default instance
