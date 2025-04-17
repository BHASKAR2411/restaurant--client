"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import LoadingSpinner from "../components/LoadingSpinner"
import { setTableData, getTableData } from "../utils/storage"
import "../styles/Home.css"

const Home = () => {
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)

  // Extract tableNo and restaurantId from URL or local storage
  const urlParams = new URLSearchParams(window.location.search)
  const tableFromUrl = urlParams.get("table")
  const restaurantFromUrl = urlParams.get("restaurant")
  const { tableNo: storedTableNo, restaurantId: storedRestaurantId } = getTableData()

  const tableNo = tableFromUrl || storedTableNo
  const restaurantId = restaurantFromUrl || storedRestaurantId

  useEffect(() => {
    if (tableFromUrl && restaurantFromUrl) {
      setTableData(tableFromUrl, restaurantFromUrl)
    }

    const fetchRestaurant = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/${restaurantId}`)
        setRestaurant(res.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching restaurant:", error)
        setLoading(false)
      }
    }

    if (restaurantId) {
      fetchRestaurant()
    } else {
      setLoading(false)
    }
  }, [restaurantId, tableFromUrl, restaurantFromUrl])

  if (loading) return <LoadingSpinner />
  if (!restaurant || !tableNo) {
    return (
      <div className="error-container">
        Error: Invalid table or restaurant. <br />
        Table: {tableNo || "Not provided"} <br />
        Restaurant ID: {restaurantId || "Not provided"}
      </div>
    )
  }

  const navigateTo = (path) => {
    window.location.href = `${path}?table=${tableNo}&restaurant=${restaurantId}`
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="restaurant-header">
          {restaurant.profilePicture ? (
            <img
              src={restaurant.profilePicture}
              alt={`${restaurant.restaurantName} logo`}
              className="restaurant-logo"
            />
          ) : (
            <div className="restaurant-logo-placeholder">
              {restaurant.restaurantName[0]}
            </div>
          )}
          <h1>{restaurant.restaurantName}</h1>
        </div>

        <h2 className="tagline">Welcome to our restaurant!!</h2>

        <div className="feature-cards">
          <div className="feature-card" onClick={() => navigateTo("/menu")}>
            <h3>Browse Menu</h3>
            <p>Explore our delicious food and drink options</p>
            <div className="card-link">View Menu →</div>
          </div>

          <div className="feature-card" onClick={() => navigateTo("/payment")}>
            <h3>Pay Bill</h3>
            <p>Quickly pay your bill using our secure payment system</p>
            <div className="card-link">Pay Now →</div>
          </div>

          <div className="feature-card" onClick={() => navigateTo("/review")}>
            <h3>Leave Review</h3>
            <p>Share your experience with us and other customers</p>
            <div className="card-link">Write Review →</div>
          </div>
        </div>

        {tableNo && <div className="table-badge">Table {tableNo}</div>}
      </div>
    </div>
  )
}

export default Home