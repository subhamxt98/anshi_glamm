import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const { data } = await axios.post(`${API}/auth/login`, { email, password })

      if (!data.isAdmin) {
        setError('Access Denied: You are not an admin.')
        setLoading(false)
        return
      }

      // ✅ Direct localStorage mein save karein
      localStorage.setItem('ishani_user', JSON.stringify(data))
      localStorage.setItem('ishani_token', data.token)
      
      // ✅ Page reload karein taaki AuthContext naya user utha le
      window.location.href = '/admin' 
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '100px', textAlign: 'center', background: '#1A1C23', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: '400px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '10px', color: '#000' }}>
        <h2>Admin Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <input 
            type="email" 
            placeholder="Admin Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '10px', background: '#FF3F6C', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin