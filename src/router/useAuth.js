// 判斷是否為已登入使用者（從 localStorage 或 sessionStorage 取 token）
export const isUserLoggedIn = () => {
  const token = localStorage.getItem('userToken') 
  const role = localStorage.getItem('userRole')
  return !!token && role === 'User'
}

// 統一取得登入使用者的 token
export function getUserToken() {
  return localStorage.getItem('userToken') 
}

// 判斷是否為訪客登入（訪客 token 只存在 localStorage）
export const isGuest = () => {
  const token = localStorage.getItem('guestToken')
  const role = localStorage.getItem('userRole')
  return !!token && role === 'Guest'
}

// 登出（清除使用者、訪客資訊）
export const logout = () => {
  localStorage.removeItem('userToken')
  localStorage.removeItem('guestToken')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('accountName')
  localStorage.removeItem('userRole')
}
