import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./cart.css";

function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cart") || "[]");
      setCart(stored);
    } catch (e) {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  const updateQty = (id, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((it) => it._id === id ? { ...it, qty } : it));
  };

  const changeInput = (id, value) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 1) return;
    updateQty(id, n);
  };

  const increment = (id) => {
    setCart((prev) => prev.map((it) => it._id === id ? { ...it, qty: (it.qty || 1) + 1 } : it));
  };

  const decrement = (id) => {
    setCart((prev) => prev.map((it) => it._id === id ? { ...it, qty: Math.max(1, (it.qty || 1) - 1) } : it));
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((it) => it._id !== id));
  };

  const total = cart.reduce((s, i) => s + (i.price * (i.qty || 1)), 0);

  return (
    <div className="cart-page">
      <div className="cart-header">
        <button className="back-btn" onClick={() => navigate('/home')}>← Back</button>
        <h2>Your Cart</h2>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">Your cart is empty. Add items from Home.</div>
      ) : (
        <div className="cart-list">
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item._id}>
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <p className="unit-price">Rs {item.price}</p>
                  <div className="qty-controls">
                    <button onClick={() => decrement(item._id)}>-</button>
                    <input
                      type="number"
                      min="1"
                      value={item.qty || 1}
                      onChange={(e) => changeInput(item._id, e.target.value)}
                    />
                    <button onClick={() => increment(item._id)}>+</button>
                  </div>
                </div>
                <div className="cart-item-right">
                  <div className="subtotal">Rs {(item.price * (item.qty || 1)).toFixed(2)}</div>
                  <button className="remove-btn" onClick={() => removeItem(item._id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-line">
              <span>Items</span>
              <span>{cart.reduce((s, i) => s + (i.qty || 1), 0)}</span>
            </div>
            <div className="summary-line total">
              <span>Total</span>
              <span>Rs {total.toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={() => alert('Proceed to checkout (not implemented)')}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
