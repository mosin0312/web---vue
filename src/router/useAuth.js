export const isUserLoggedIn = () => {
  const token = localStorage.getItem('userToken')
  const role = localStorage.getItem('userRole')
  return !!token && role === 'User'
}

export const isGuest = () => {
  const token = localStorage.getItem('guestToken')
  const role = localStorage.getItem('userRole')
  return !!token && role === 'Guest'
}

export const logout = () => {
  localStorage.clear()
}