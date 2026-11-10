import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios' 
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext' // 👈 Auth token ke liye
import './css/myorders.css'

const MyOrders = () => {
  const [filter, setFilter] = useState('all')
  const [orders, setOrders] = useState([]) // 👈 Hardcoded orders ki jagah state
  const [loading, setLoading] = useState(true)
  
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth() // User ka token nikalne ke liye

  // ===== FETCH ORDERS FROM BACKEND =====
  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const backendURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        
        const { data } = await axios.get(`${backendURL}/orders/myorders`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        // Backend data ko frontend format mein map kiya
        const formattedOrders = data.map((order) => ({
          id: order._id, // Database ID (MongoDB _id)
          // Agar aapke model mein custom orderId field hai toh order.orderId use karein
          date: new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          status: order.isDelivered ? 'delivered' : order.isPaid ? 'shipped' : 'processing',
          total: order.totalPrice,
          items: order.orderItems.map((item) => ({
            id: item.productId,
            name: item.name,
            qty: item.quantity,
            price: item.price,
            image: item.image,
          })),
        }))

        setOrders(formattedOrders)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setLoading(false)
      }
    }

    if (user) {
      fetchMyOrders()
    }
  }, [user])

  const filters = [
    { key: 'all', label: 'All Orders' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ]

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const statusColors = {
    delivered: 'status-delivered',
    shipped: 'status-shipped',
    processing: 'status-processing',
  }

  const statusIcons = {
    delivered: 'bi-check-circle-fill',
    shipped: 'bi-truck',
    processing: 'bi-clock-fill',
  }

  // ===== REORDER =====
  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.qty,
      })
    })
    navigate('/cart')
  }

  // ===== INVOICE DOWNLOAD =====
  const handleInvoice = (order) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Invoice ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #282C3F; }
          h1 { color: #FF3F6C; font-size: 28px; margin: 0 0 6px; }
          .sub { color: #7E808C; font-size: 12px; margin-bottom: 24px; }
          .head { display: flex; justify-content: space-between; border-bottom: 2px solid #FF3F6C; padding-bottom: 16px; margin-bottom: 24px; }
          .head-right { text-align: right; font-size: 13px; }
          .head-right strong { font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #FFF5F7; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #FF3F6C; }
          th:last-child { text-align: right; }
          td { padding: 12px; border-bottom: 1px solid #EBEBEE; font-size: 14px; }
          td:last-child { text-align: right; font-weight: 700; }
          .total { background: #FFF5F7; font-weight: 700; color: #FF3F6C; font-size: 15px; }
          .total td { border: none; }
          .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #7E808C; }
        </style>
      </head>
      <body>
        <div class="head">
          <div>
            <h1>ANSHIÉ's GLAM</h1>
            <div class="sub">Premium Cosmetics</div>
          </div>
          <div class="head-right">
            <strong>TAX INVOICE</strong><br/>
            Order #${order.id}<br/>
            Date: ${order.date}
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${order.items.map(i => `
              <tr>
                <td>${i.name}</td>
                <td>${i.qty}</td>
                <td>₹${i.price.toLocaleString('en-IN')}</td>
                <td>₹${(i.price * i.qty).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3">Grand Total</td>
              <td>₹${order.total.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          Thank you for shopping with <strong style="color:#FF3F6C;">ANSHIÉ's GLAM</strong> 💖
        </div>
      </body>
      </html>
    `

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Invoice-${order.id}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Loading State
  if (loading) {
    return (
      <div className="orders-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <h3>Loading your orders...</h3>
      </div>
    )
  }

  return (
    <div className="orders-page">
      <div className="orders-container">

        <div className="orders-header">
          <span className="orders-label">My Account</span>
          <h1 className="orders-title">My <span className="italic">Orders</span></h1>
          <p className="orders-desc">Track and manage all your orders in one place</p>
        </div>

        <div className="orders-filters">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`orders-filter-btn ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <i className="bi bi-bag-x"></i>
            <h3>No orders found</h3>
            <p>You haven't placed any orders in this category yet.</p>
            <Link to="/shop" className="orders-empty-btn">
              Start Shopping <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div className="order-header-left">
                    <span className="order-id">Order #{order.id.slice(-8).toUpperCase()}</span>
                    {/* .slice(-8) isliye taaki lambi MongoDB ID chhoti dikhe, jaise '1A2B3C4D' */}
                    <span className="order-date">Placed on {order.date}</span>
                  </div>
                  <span className={`order-status ${statusColors[order.status]}`}>
                    <i className={`bi ${statusIcons[order.status]}`}></i>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div className="order-item" key={idx}>
                      <img src={item.image} alt={item.name} className="order-item-img" />
                      <div className="order-item-info">
                        <h4>{item.name}</h4>
                        <span className="order-item-qty">Qty: {item.qty}</span>
                      </div>
                      <span className="order-item-price">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <div className="order-total">
                    <span>Total</span>
                    <strong>₹{order.total.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="order-actions">
                    <button
                      className="order-btn-secondary"
                      onClick={() => handleInvoice(order)}
                    >
                      <i className="bi bi-download"></i> Invoice
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        className="order-btn-primary"
                        onClick={() => handleReorder(order)}
                      >
                        <i className="bi bi-arrow-repeat"></i> Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default MyOrders