import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [cart, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("cart") || "[]");
        } catch (e) {
            return [];
        }
    });
    const [foodItems, setFoodItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Get username from localStorage or session
        const username = localStorage.getItem("currentUser");
        if (username) {
            setUser(username);
        }
        
        // Fetch food items from API
        fetchFoodItems();
    }, []);

    const fetchFoodItems = async () => {
        try {
            const response = await axios.get("http://localhost:3000/food");
            if (response.data.success) {
                setFoodItems(response.data.data);
            }
        } catch (err) {
            console.error("Error fetching food items:", err);
            setError("Could not load food items");
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        setError("");
        try {
            // Call logout endpoint
            await axios.post("http://localhost:3000/logout");
            
            // Clear localStorage
            localStorage.removeItem("currentUser");
            
            // Navigate to signin
            navigate("/signin");
        } catch (error) {
            setError("Logout failed. Please try again.");
            console.error("Logout error:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (item) => {
        setCart((prev) => {
            const exists = prev.find((p) => p._id === item._id);
            let next;
            if (exists) {
                next = prev.map((p) => p._id === item._id ? { ...p, qty: (p.qty || 1) + 1 } : p);
            } else {
                next = [...prev, { ...item, qty: 1 }];
            }
            try { localStorage.setItem("cart", JSON.stringify(next)); } catch (e) {}
            return next;
        });
        console.log(`${item.name} added to cart`);
    };

    const getCartCount = () => cart.reduce((s, i) => s + (i.qty || 1), 0);

    return (
        <div className="home-container">
            <div
                className="cart-button"
                role="button"
                onClick={() => navigate('/cart')}
                title="View cart"
            >
                <span className="cart-icon">🛒</span>
                <span className="cart-count">{getCartCount()}</span>
            </div>
            <div className="home-header">
                <h1>Welcome to FoodHub! 🍽️</h1>
                <p className="subtitle">Your favorite food delivery platform</p>
            </div>

            <div className="home-content">
                <div className="welcome-card">
                    <div className="card-header">
                        <h2>Hello, <span className="username">{user || "User"}</span>! 👋</h2>
                        <p className="status">You are successfully logged in</p>
                    </div>

                    <div className="card-body">
                        <div className="info-section">
                            <h3>What's next?</h3>
                            <ul className="feature-list">
                                <li>✓ Browse delicious food options</li>
                                <li>✓ Add items to your cart</li>
                                <li>✓ Place your order</li>
                                <li>✓ Track your delivery</li>
                            </ul>
                        </div>

                        <div className="quick-actions">
                            <h3>Quick Actions</h3>
                            <button className="action-btn">🍕 Order Now</button>
                            <button className="action-btn">❤️ My Favorites</button>
                            <button className="action-btn">📦 Order History</button>
                            <button 
                                className="action-btn admin-btn"
                                onClick={() => navigate("/admin")}
                            >
                                ⚙️ Admin Panel
                            </button>
                        </div>

                        {/* Food Items Menu */}
                        <div className="menu-section">
                            <h3>🍽️ Our Popular Dishes</h3>
                            {foodItems.length > 0 ? (
                                <div className="food-grid">
                                    {foodItems.map((item) => (
                                        <div key={item._id} className="food-card">
                                            <div className="food-image-container">
                                                <img src={item.image} alt={item.name} className="food-image" />
                                                <div className="food-overlay">
                                                    <button 
                                                        className="add-to-cart-btn"
                                                        onClick={() => addToCart(item)}
                                                    >
                                                        + Add to Cart
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="food-info">
                                                <h4 className="food-name">{item.name}</h4>
                                                <p className="food-price">Rs {item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-items">No food items available. Go to Admin to add items!</p>
                            )}
                        </div>
                    </div>

                    <div className="card-footer">
                        {error && <div className="alert alert-error">{error}</div>}
                        <button 
                            onClick={handleLogout}
                            className="btn-logout"
                            disabled={loading}
                        >
                            {loading ? "Logging out..." : "🚪 Logout"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
