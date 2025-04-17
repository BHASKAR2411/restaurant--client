"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import LoadingSpinner from "../components/LoadingSpinner"
import { getTableData } from "../utils/storage"
import "../styles/Payment.css"

const Payment = () => {
  const [amount, setAmount] = useState("")
  const [upiId, setUpiId] = useState("")
  const [loading, setLoading] = useState(true)
  const { tableNo, restaurantId } = getTableData()

  useEffect(() => {
    if (!restaurantId) {
      toast.error("Invalid restaurant ID")
      setLoading(false)
      return
    }

    const fetchUpiId = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/${restaurantId}`)
        setUpiId(res.data.upiId)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching UPI ID:", error)
        toast.error("Failed to load payment details")
        setLoading(false)
      }
    }
    fetchUpiId()
  }, [restaurantId])

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      toast.warn("Please enter a valid amount")
      return
    }
    if (!upiId) {
      toast.error("UPI ID not available")
      return
    }

    const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=Restaurant&am=${amount}&cu=INR`
    window.location.href = upiLink
  }

  const navigateToHome = () => {
    window.location.href = `/?table=${tableNo}&restaurant=${restaurantId}`
  }

  if (!restaurantId) {
    return <div className="error-container">Error: Invalid restaurant</div>
  }

  return (
    <div className="payment-container">
      {loading && <LoadingSpinner />}

      <div className="payment-header">
        <button className="back-button" onClick={navigateToHome}>
          ← Back
        </button>
        <h2>Pay Your Bill</h2>
        {tableNo && <div className="table-badge">Table {tableNo}</div>}
      </div>

      <div className="payment-content">
        <div className="payment-card">
          <div className="payment-icon">₹</div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Amount (₹)"
            min="0"
            step="0.01"
          />
          <button onClick={handleSubmit}>Pay Now</button>
        </div>
      </div>
    </div>
  )
}

export default Payment
