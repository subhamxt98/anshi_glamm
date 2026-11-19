import React, { useState, useEffect } from 'react'
import { Link, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import './css/admin.css'

// ============================================
// 1. ADMIN DASHBOARD
// ============================================
const AdminDashboard = ({ token }) => {
  const [stats, setStats] = useState({ products: 0, orders: 0 })
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [p, o] = await Promise.all([
          axios.get(`${API}/admin/items`, { headers }),
          axios.get(`${API}/admin/orders`, { headers })
        ])
        setStats({ products: p.data.length, orders: o.data.length })
      } catch (err) { console.error(err) }
    }
    fetchStats()
  }, [token, API])

  return (
    <div>
      <h2 className="admin-page-title">Dashboard Overview</h2>
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <i className="bi bi-box-seam" style={{ fontSize: '32px', color: '#FF3F6C' }}></i>
          <h3 style={{ marginTop: '10px' }}>{stats.products}</h3>
          <p>Total Products Listed</p>
        </div>
        <div className="admin-stat-card">
          <i className="bi bi-bag-check" style={{ fontSize: '32px', color: '#03A685' }}></i>
          <h3 style={{ marginTop: '10px' }}>{stats.orders}</h3>
          <p>Total Orders Placed</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 2. ADMIN PRODUCTS (Dynamic Category & Search)
// ============================================
const AdminProducts = ({ token }) => {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All') // 👈 Category Tab State
  
  const [form, setForm] = useState({ name: '', description: '', price: '', oldPrice: '', category: '', countInStock: '', rating: 4.5 })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const fetchProducts = async () => {
    setFetchLoading(true)
    try {
      const { data } = await axios.get(`${API}/admin/items`, { headers: { Authorization: `Bearer ${token}` } })
      setProducts(data)
    } catch (err) { 
      setError('Failed to fetch products') 
    } finally { 
      setFetchLoading(false) 
    }
  }

  useEffect(() => { if (token) fetchProducts() }, [token])

  // 1. Saari unique categories nikalo database se
  const uniqueCategories = ['All', ...new Set(products.map(p => p.category.toLowerCase()))]

  // 2. Category aur Search dono ka filter logic
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeTab === 'All' || p.category.toLowerCase() === activeTab.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (image && !image.type.startsWith('image/')) {
      setError('Sirf image files allowed hain!')
      return;
    }
    if (!image && !editId) return alert('Please select an image')
    setLoading(true)
    setError('')
    
    const formData = new FormData()
    Object.keys(form).forEach(key => formData.append(key, form[key]))
    if (image) formData.append('image', image)

    try {
      if (editId) {
        await axios.put(`${API}/admin/items/${editId}`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
        alert('Product Updated!')
      } else {
        await axios.post(`${API}/admin/items`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } })
        alert('Product Added!')
      }
      setForm({ name: '', description: '', price: '', oldPrice: '', category: '', countInStock: '', rating: 4.5 })
      setImage(null)
      setEditId(null)
      e.target.reset()
      fetchProducts()
    } catch (err) { 
      setError(err.response?.data?.message || 'Error saving product') 
    } finally { 
      setLoading(false) 
    }
  }

  const handleEdit = (product) => {
    setForm({ 
      name: product.name, 
      description: product.description, 
      price: product.price, 
      oldPrice: product.oldPrice || '', 
      category: product.category, 
      countInStock: product.countInStock,
      rating: product.rating || 4.5
    })
    setEditId(product._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await axios.delete(`${API}/admin/items/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    fetchProducts()
  }

  return (
    <div>
      <h2 className="admin-page-title">{editId ? 'Edit Product' : 'Add New Product'}</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold' }}>{error}</div>}

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-grid">
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input placeholder="Category (e.g. face, lips)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
            <input placeholder="Price (₹)" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            <input placeholder="Old Price / MRP (₹)" type="number" value={form.oldPrice} onChange={e => setForm({...form, oldPrice: e.target.value})} />
            <input placeholder="Stock Count" type="number" value={form.countInStock} onChange={e => setForm({...form, countInStock: e.target.value})} required />
            <input placeholder="Rating (0-5)" type="number" step="0.1" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          
          <div className="file-input-group">
            <label>Product Image (Only JPG/PNG)</label>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={e => {
                const file = e.target.files[0];
                if (file && !file.type.startsWith('image/')) {
                  alert("Bhai, sirf photo select karein! Video allowed nahi hai.");
                  e.target.value = null;
                  setImage(null);
                } else {
                  setImage(file);
                }
              }} 
              required={!editId} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="admin-btn-primary" disabled={loading} style={{ padding: '12px 24px' }}>
              {loading ? 'Saving...' : (editId ? 'Update Product' : 'Add Product')}
            </button>
            {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', description: '', price: '', oldPrice: '', category: '', countInStock: '', rating: 4.5 }); }} className="admin-btn-delete" style={{ padding: '12px 24px' }}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* ===== DYNAMIC CATEGORY SECTIONS ===== */}
      <div style={{ marginTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
          <h2 className="admin-page-title" style={{ margin: 0 }}>Listed Products ({filteredProducts.length})</h2>
          
          <div className="admin-search-box">
            <i className="bi bi-search"></i>
            <input 
              type="text" 
              placeholder="Search by name or category..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills / Tabs */}
        <div className="category-tabs">
          {uniqueCategories.map((cat, index) => {
            // Har category mein kitne products hain woh count karo
            const count = cat === 'All' ? products.length : products.filter(p => p.category.toLowerCase() === cat).length;
            return (
              <button 
                key={index} 
                className={`category-tab-btn ${activeTab === cat ? 'active' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                <span style={{ textTransform: 'capitalize' }}>{cat}</span>
                <span className="cat-count">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Table */}
        <div className="admin-card">
          {fetchLoading ? <p>Loading...</p> : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No products found in this section.</td></tr>
                  ) : (
                    filteredProducts.map(p => (
                      <tr key={p._id}>
                        <td><img src={p.image} alt={p.name} className="admin-table-img" /></td>
                        <td style={{ fontWeight: '600' }}>{p.name}</td>
                        <td>₹{p.price}</td>
                        <td><span style={{ textTransform: 'capitalize', background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>{p.category}</span></td>
                        <td>{p.countInStock}</td>
                        <td>
                          <button onClick={() => handleEdit(p)} className="admin-btn-primary" style={{ marginRight: '5px' }}>Edit</button>
                          <button onClick={() => handleDelete(p._id)} className="admin-btn-delete">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// 3. ADMIN ORDERS
// ============================================
const AdminOrders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const [orderSearch, setOrderSearch] = useState('')
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const fetchOrders = async () => {
    const { data } = await axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
    setOrders(data)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/admin/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } })
    fetchOrders()
  }

  const filteredOrders = orders.filter((o) => {
    const query = orderSearch.toLowerCase();
    const orderId = `#${o._id.slice(-6).toUpperCase()}`.toLowerCase();
    const customerName = (o.user?.name || '').toLowerCase();
    return orderId.includes(query) || customerName.includes(query);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 className="admin-page-title" style={{ margin: 0 }}>Manage Orders</h2>
        <div className="admin-search-box">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Search by Order ID or Customer..." 
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead><tr><th>Order ID</th><th>Customer</th><th>Address</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No orders found matching your search.</td></tr>
              ) : (
                filteredOrders.map(o => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 'bold' }}>#{o._id.slice(-6).toUpperCase()}</td>
                    <td>{o.user?.name || 'N/A'}<br/><small>{o.user?.email}</small></td>
                    <td>
                      {o.shippingAddress?.address}, {o.shippingAddress?.city}<br/>
                      {o.shippingAddress?.postalCode}
                    </td>
                    <td>₹{o.totalPrice}</td>
                    <td>
                      {o.isDelivered ? <span className="badge-delivered">Delivered</span> : <span className="badge-processing">Processing</span>}
                    </td>
                    <td>
                      {!o.isDelivered ? (
                        <button onClick={() => updateStatus(o._id, 'delivered')} className="admin-btn-primary">Mark Delivered</button>
                      ) : <span style={{ color: '#03A685', fontWeight: 'bold' }}>Completed</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================
// 4. MAIN ADMIN LAYOUT
// ============================================
const AdminPanel = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('ishani_token')
  const user = JSON.parse(localStorage.getItem('ishani_user') || '{}')

  useEffect(() => {
    if (!token || !user.isAdmin) navigate('/admin-login')
  }, [token, user, navigate])

  const handleLogout = () => {
    localStorage.removeItem('ishani_user')
    localStorage.removeItem('ishani_token')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path ? 'admin-nav-link active' : 'admin-nav-link'

  const getPageTitle = () => {
    if (location.pathname === '/admin') return 'Dashboard'
    if (location.pathname === '/admin/products') return 'Products Management'
    if (location.pathname === '/admin/orders') return 'Orders Management'
    return 'Admin'
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>ANSHIÉ's GLAM</h2>
        <nav>
          <Link to="/admin" className={isActive('/admin')}><i className="bi bi-grid"></i> Dashboard</Link>
          <Link to="/admin/products" className={isActive('/admin/products')}><i className="bi bi-box"></i> Products</Link>
          <Link to="/admin/orders" className={isActive('/admin/orders')}><i className="bi bi-truck"></i> Orders</Link>
        </nav>
      </aside>

      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1>{getPageTitle()}</h1>
          </div>
          <div className="topbar-right">
            <span className="admin-user-name">Hi, <strong>{user.name}</strong></span>
            <button onClick={handleLogout} className="admin-logout-btn">
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </header>

        <main className="admin-main">
          <Routes>
            <Route path="/" element={<AdminDashboard token={token} />} />
            <Route path="/products" element={<AdminProducts token={token} />} />
            <Route path="/orders" element={<AdminOrders token={token} />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AdminPanel