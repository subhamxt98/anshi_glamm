import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // App load pe token check
  useEffect(() => {
    const storedUser = localStorage.getItem('ishani_user')
    const storedToken = localStorage.getItem('ishani_token')

    if (storedUser) setUser(JSON.parse(storedUser))
    if (storedToken) setToken(storedToken)

    setLoading(false)
  }, [])

  // ===== REGISTER =====
  const register = async ({ name, email, password }) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed')

    setUser(data)
    setToken(data.token)
    localStorage.setItem('ishani_user', JSON.stringify(data))
    localStorage.setItem('ishani_token', data.token)
    return data
  }

  // ===== LOGIN =====
  const login = async ({ email, password }) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')

    setUser(data)
    setToken(data.token)
    localStorage.setItem('ishani_user', JSON.stringify(data))
    localStorage.setItem('ishani_token', data.token)
    return data
  }

  // ===== UPDATE USER (profile update ke baad) =====
  const updateUser = (newData) => {
    const updated = { ...user, ...newData }
    setUser(updated)
    localStorage.setItem('ishani_user', JSON.stringify(updated))

    if (newData.token) {
      setToken(newData.token)
      localStorage.setItem('ishani_token', newData.token)
    }
  }

  // ===== LOGOUT =====
  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ishani_user')
    localStorage.removeItem('ishani_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}