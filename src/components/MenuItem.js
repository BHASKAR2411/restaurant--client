import React from 'react';
import '../styles/Menu.css';

const MenuItem = ({ item, isSelected, onSelect, onIncrement, onDecrement, quantity }) => (
  <li className="menu-item">
    <label>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(item)}
      />
      <span>
        {item.name} ({item.isVeg ? 'Veg' : 'Non-Veg'}) - ₹{item.price}
      </span>
    </label>
    {isSelected && (
      <div className="quantity-controls">
        <button onClick={onDecrement}>-</button>
        <span>{quantity}</span>
        <button onClick={onIncrement}>+</button>
      </div>
    )}
  </li>
);

export default MenuItem;