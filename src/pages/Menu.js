"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import MenuItem from "../components/MenuItem"
import LoadingSpinner from "../components/LoadingSpinner"
import { setTableData, getTableData, clearTableData } from "../utils/storage"
import "../styles/Menu.css"

const Menu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [loading, setLoading] = useState(true)

  // Extract tableNo and restaurantId from URL or local storage
  const urlParams = new URLSearchParams(window.location.search)
  const tableFromUrl = urlParams.get("table")
  const restaurantFromUrl = urlParams.get("restaurant")
  const { tableNo: storedTableNo, restaurantId: storedRestaurantId } = getTableData()

  const tableNo = tableFromUrl || storedTableNo
  let restaurantId = restaurantFromUrl || storedRestaurantId

  // Debug raw restaurantId value
  console.log("Raw restaurantId (from URL or storage):", restaurantId)

  // Validate and convert restaurantId to a number
  restaurantId = Number(restaurantId)

  useEffect(() => {
    if (tableFromUrl && restaurantFromUrl) {
      setTableData(tableFromUrl, restaurantFromUrl)
    }

    if (isNaN(restaurantId) || restaurantId <= 0) {
      console.error("Invalid restaurantId:", restaurantId)
      toast.error("Invalid restaurant ID. Please try again.")
      clearTableData() // Clear local storage to force re-setting from URL
      setLoading(false)
      return
    }

    const fetchMenu = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/menu?restaurantId=${restaurantId}`)
        setMenuItems(res.data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching menu:", error)
        toast.error("Failed to load menu")
        setLoading(false)
      }
    }
    fetchMenu()
  }, [restaurantId, tableFromUrl, restaurantFromUrl])

  const handleSelect = (item, increment = true) => {
    setSelectedItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        if (increment) {
          return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        } else {
          if (existingItem.quantity === 1) {
            return prevItems.filter((i) => i.id !== item.id)
          }
          return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
        }
      } else if (increment) {
        return [...prevItems, { ...item, quantity: 1 }]
      }
      return prevItems
    })
  }

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.warn("Please select at least one item")
      return
    }

    const preparedItems = selectedItems.map((item) => ({
      id: item.id,
      name: item.name,
      isVeg: item.isVeg,
      price: item.price,
      quantity: item.quantity,
    }))

    const payload = {
      tableNo: Number(tableNo),
      items: preparedItems,
      total: selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      restaurantId,
    }
    console.log("Order payload:", payload)

    // Additional validation for restaurantId
    if (!restaurantId || restaurantId <= 0) {
      toast.error("Restaurant ID is invalid. Please try again.")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/users/${restaurantId}`)
      await axios.post(`${process.env.REACT_APP_API_URL}/orders`, payload)
      toast.success("Order placed successfully")
      setSelectedItems([])
    } catch (error) {
      console.error("Error placing order:", error)
      const errorMessage = error.response?.data?.message || "Failed to place order"
      toast.error(errorMessage)
    }
    setLoading(false)
  }

  const navigateToHome = () => {
    window.location.href = `/?table=${tableNo}&restaurant=${restaurantId}`
  }

  const groupedMenu = menuItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || []
    acc[item.category].push(item)
    return acc
  }, {})

  if (!tableNo || !restaurantId) {
    return (
      <div className="error-container">
        Error: Invalid table or restaurant. <br />
        Table: {tableNo || "Not provided"} <br />
        Restaurant ID: {restaurantId || "Not provided"}
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="menu-container">
      <div className="menu-header">
        <button className="back-button" onClick={navigateToHome}>
          ← Back
        </button>
        <h2>Our Menu</h2>
        {tableNo && <div className="table-badge">Table {tableNo}</div>}
      </div>

      <div className="menu-content">
        {Object.keys(groupedMenu).length === 0 ? (
          <p>No menu items available</p>
        ) : (
          Object.keys(groupedMenu).map((category) => (
            <div key={category} className="menu-category">
              <h3>{category}</h3>
              <ul>
                {groupedMenu[category].map((item) => {
                  const selectedItem = selectedItems.find((i) => i.id === item.id)
                  const quantity = selectedItem ? selectedItem.quantity : 0
                  return (
                    <div key={item.id} className="menu-item-wrapper">
                      <MenuItem
                        item={item}
                        isSelected={!!selectedItem}
                        onSelect={() => handleSelect(item, true)}
                        onIncrement={() => handleSelect(item, true)}
                        onDecrement={() => handleSelect(item, false)}
                        quantity={quantity}
                      />
                    </div>
                  )
                })}
              </ul>
            </div>
          ))
        )}
        {selectedItems.length > 0 && (
          <div className="order-summary">
            <h4>Selected Items: {selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</h4>
            <p>Total: ₹{selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)}</p>
            <button onClick={handleSubmit}>Submit Order</button>
          </div>
        )}
        <footer className="page-footer">
          Powered by SAE. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default Menu
