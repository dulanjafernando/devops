import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import foodImage from "./assets/food.jpg";
import "./signin.css";

function SignIn() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        
        try {
            const response = await axios.post("http://localhost:3000/signin", formData);
            // Save username to localStorage
            localStorage.setItem("currentUser", formData.username);
            setMessage("✓ Sign in successful!");
            // Navigate to home page after a short delay
            setTimeout(() => {
                navigate("/home");
            }, 500);
        } catch (error) {
            setError(error.response?.data?.message || "Sign in failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Left Side - Food Image */}
            <div className="auth-left">
                <div className="image-container">
                    <img src={foodImage} alt="Delicious Food" className="food-image" />
                    <div className="image-overlay"></div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="auth-right">
                <div className="form-box">
                    <div className="form-header">
                        <h1>Welcome Back</h1>
                        <p>Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="signin-form">
                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                placeholder="Enter your username"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                            />
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}
                        {message && <div className="alert alert-success">{message}</div>}

                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="form-footer">
                        <p>Don't have an account? <Link to="/signup" className="link">Sign up</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
