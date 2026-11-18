import React, { useState, useEffect } from 'react'
import axios from 'axios'

const AdminProducts = ({ token }) => {
  const [products, setProducts] = useState([])
  
  // Form States (Discount, oldPrice included)
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    oldPrice: '', 
    category: '', 
    countInStock: '',
    rating: 4.5 
  })
  const [image, setImage] = useState(null)
  
  // UI States
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null) // Edit mode

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  // 1. Products Fetch karna
  const fetchProducts = async () => {
    setFetchLoading(true)
    setError('')
    try {
      const { data } = await axios.get(`${API}/admin/items`, { 
        headers: { Authorization: `Bearer ${token}` } 
      })
      setProducts(data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Products load nahi ho paye. Check token.')
    } finally {
      setFetchLoading(false)
    }
  }

  useEffect(() => { 
    if (token) fetchProducts() 
  }, [token])

  // 2. Add ya Update Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image && !editId) return alert('Naye product ke liye image select karein')
    setLoading(true)
    setError('')

    const formData = new FormData()
    Object.keys(form).forEach(key => formData.append(key, form[key]))
    if (image) formData.append('image', image)

    try {
      if (editId) {
        // Edit (Update)
        await axios.put(`${API}/admin/items/${editId}`, formData, { 
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
        })
        alert('✅ Product Updated Successfully!')
      } else {
        // Add (New)
        await axios.post(`${API}/admin/items`, formData, { 
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } 
        })
        alert('✅ New Product Added!')
      }
      
      // Reset Form
      setForm({ name: '', description: '', price: '', oldPrice: '', category: '', countInStock: '', rating: 4.5 })
      setImage(null)
      setEditId(null)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product')
    } finally {
      setLoading(false)
    }
  }

  // 3. Edit Button
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

  const cancelEdit = () => {
    setEditId(null)
    setForm({ name: '', description: '', price: '', oldPrice: '', category: '', countInStock: '', rating: 4.5 })
    setImage(null)
  }

  // 4. Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    try {
      await axios.delete(`${API}/admin/items/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      fetchProducts()
    } catch (err) { alert('Error deleting product') }
  }

  return (
    <div>
      {/* ===== SECTION 1: FORM ===== */}
      <h2 className="admin-page-title">{editId ? 'Edit Product Details' : 'Add New Product'}</h2>

      {error && <div style={{ color: 'red', marginBottom: '20px', fontWeight: 'bold' }}>{error}</div>}

      <div className="admin-card">
        <form onSubmit={handleSubmit} className="admin-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input placeholder="Category (e.g. Lips, Face)" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
            
            <input placeholder="Selling Price (₹)" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            <input placeholder="Original Price / MRP (₹)" type="number" value={form.oldPrice} onChange={e => setForm({...form, oldPrice: e.target.value})} />
            
            <input placeholder="Stock Count" type="number" value={form.countInStock} onChange={e => setForm({...form, countInStock: e.target.value})} required />
            <input placeholder="Rating (0-5)" type="number" step="0.1" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />
          </div>
          
          <textarea placeholder="Description" rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
          
          <div style={{ marginTop: '10px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Product Image {editId && '(Nayi image nahi daalni toh chhod dein)'}
            </label>
            <input type="file" onChange={e => setImage(e.target.files[0])} required={!editId} />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" className="admin-btn-primary" disabled={loading} style={{ padding: '12px 30px', fontSize: '14px' }}>
              {loading ? 'Saving...' : (editId ? 'Update Product' : 'Add Product')}
            </button>
            {editId && (
              <button type="button" onClick={cancelEdit} style={{ background: '#6B7280', color: '#fff', border: 'none', borderRadius: '6px', padding: '12px 30px', fontWeight: 'bold', cursor: 'pointer' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ===== SECTION 2: PRODUCTS TABLE ===== */}
      <h2 className="admin-page-title" style={{ marginTop: '40px' }}>Listed Products ({products.length})</h2>
      
      {fetchLoading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>Database mein koi product nahi hai.</p>
      ) : (
        <div className="admin-card" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price (Sell / MRP)</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td>
                    <img 
                      src={p.image} 
                      alt={p.name} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} 
                    />
                  </td>
                  <td style={{ fontWeight: '600', fontSize: '14px' }}>{p.name}</td>
                  <td>
                    <span style={{ fontWeight: 'bold' }}>₹{p.price}</span>
                    {p.oldPrice && (
                      <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '12px', marginLeft: '5px' }}>
                        ₹{p.oldPrice}
                      </span>
                    )}
                  </td>
                  <td><span style={{ background: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{p.category}</span></td>
                  <td>{p.countInStock}</td>
                  <td>
                    <button onClick={() => handleEdit(p)} className="admin-btn-primary" style={{ marginRight: '8px', padding: '6px 12px' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="admin-btn-delete" style={{ padding: '6px 12px' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProducts