import React, { useState, useEffect } from 'react'
import axios from 'axios'

const AdminOrders = ({ token }) => {
  const [orders, setOrders] = useState([])
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

  const fetchOrders = async () => {
    const { data } = await axios.get(`${API}/admin/orders`, { headers: { Authorization: `Bearer ${token}` } })
    setOrders(data)
  }

  useEffect(() => { fetchOrders() }, [])

  const markDelivered = async (id) => {
    await axios.put(`${API}/admin/orders/${id}/status`, { status: 'delivered' }, { headers: { Authorization: `Bearer ${token}` } })
    fetchOrders()
  }

  return (
    <div>
      <h2 className="admin-page-title">All Orders</h2>
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td>#{o._id.slice(-6)}</td>
                <td>{o.user?.name}</td>
                <td>₹{o.totalPrice}</td>
                <td>{o.isDelivered ? <span className="badge-delivered">Delivered</span> : <span className="badge-processing">Processing</span>}</td>
                <td>{!o.isDelivered && <button className="admin-btn-primary" onClick={() => markDelivered(o._id)}>Mark Delivered</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminOrders // ✅ Yeh line zaroori hai