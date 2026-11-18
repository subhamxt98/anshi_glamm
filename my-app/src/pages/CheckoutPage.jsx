// src/pages/CheckoutPage.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { handlePayment } from '../utils/razorpay'
import './css/checkout.css'

const CheckoutPage = () => {
  const { cartItems, getSubtotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  })

  const subtotal = getSubtotal()
  const shipping = subtotal > 999 ? 0 : 99
  const tax = Math.round(subtotal * 0.05)
  const total = subtotal + shipping + tax

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  if (cartItems.length === 0) {
    navigate('/cart')
    return null
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill all delivery details.')
      return
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number.')
      return
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setError('Please enter a valid 6-digit pincode.')
      return
    }

    setLoading(true)

    const shippingAddress = {
      address: formData.address,
      city: formData.city,
      state: formData.state,
      postalCode: formData.pincode,
      country: 'India',
      phone: formData.phone,
      fullName: formData.fullName,
    }

    await handlePayment({
      amount: total,
      user,
      onSuccess: async (data) => {
        try {
          const backendURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

          const orderData = {
            orderItems: cartItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              image: item.image,
              price: item.price,
              productId: item.id,
            })),
            shippingAddress,
            paymentMethod: 'Razorpay',
            totalPrice: total,
          }

          const { data: createdOrder } = await axios.post(
            `${backendURL}/orders`,
            orderData,
            { headers: { Authorization: `Bearer ${user.token}` } }
          )

          clearCart()
          navigate('/order-success', {
            state: {
              paymentId: data.payment_id,
              amount: total,
              orderId: createdOrder._id,
              address: shippingAddress,
            },
          })
        } catch (err) {
          console.error(err)
          setError('Payment successful, but failed to save order. Please contact support.')
        }
      },
      onFailure: (msg) => {
        setError(msg || 'Payment failed. Please try again.')
        setLoading(false)
      },
    })
  }

  return (
    <div className="checkout-page">
      <div className="container py-5">
        <div className="checkout-header text-center mb-5">
          <span className="checkout-label">Checkout</span>
          <h1 className="checkout-title">Delivery <span className="italic">Details</span></h1>
          <p className="checkout-desc">Enter your shipping information to proceed with payment</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-7">
            <form className="checkout-form-card" onSubmit={handleSubmit}>
              {error && (
                <div className="checkout-error">
                  <i className="bi bi-exclamation-triangle-fill"></i> {error}
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                  />
                </div>
                <div className="col-12">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="House no, street, landmark"
                    rows={3}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="checkout-submit-btn mt-4" disabled={loading}>
                {loading ? (
                  <>
                    <span className="checkout-spinner"></span> Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-lock-fill"></i> Pay ₹{total.toLocaleString('en-IN')}
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="col-lg-5">
            <div className="checkout-summary">
              <h3 className="checkout-summary-title">Order Summary</h3>
              {cartItems.map((item) => (
                <div className="checkout-summary-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <span>Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="checkout-summary-divider"></div>
              <div className="checkout-summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="checkout-summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
              <div className="checkout-summary-row"><span>Tax (5%)</span><span>₹{tax}</span></div>
              <div className="checkout-summary-row total"><span>Total</span><span>₹{total}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage