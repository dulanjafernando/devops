import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS } from "./config/api.js";
import "./admin.css";

function Admin() {
    const navigate = useNavigate();
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [imagePreview, setImagePreview] = useState("");
    
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        image: "",
        description: ""
    });
    const [isImageReady, setIsImageReady] = useState(true);

    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.FOOD_LIST}`);
            if (response.data.success) {
                setFoods(response.data.data);
            }
        } catch (err) {
            setError("Error fetching food items");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        
        if (type === "file") {
            const file = files[0];
            if (file) {
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    setError("File size must be less than 5MB");
                    return;
                }

                setIsImageReady(false); // Mark as not ready while processing
                
                // Read file and convert to base64
                const reader = new FileReader();
                reader.onloadend = () => {
                    // Compress image before storing
                    compressImage(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const compressImage = (base64String) => {
        const img = new Image();
        img.src = base64String;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Resize if too large (max 1200px width)
            const maxWidth = 1200;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 80% quality
            const compressed = canvas.toDataURL('image/jpeg', 0.8);
            setFormData(prev => ({ ...prev, image: compressed }));
            setImagePreview(compressed);
            setIsImageReady(true); // Mark as ready after compression
        };
        img.onerror = () => {
            setError("Failed to process image");
            setIsImageReady(true);
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validate form
        if (!formData.name || !formData.price) {
            setError("Food name and price are required");
            return;
        }

        if (!editingId && !formData.image) {
            setError("Image is required for new food items");
            return;
        }

        if (!isImageReady && !editingId) {
            setError("Please wait for image to finish processing");
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                name: formData.name,
                price: parseFloat(formData.price),
                description: formData.description || ""
            };

            // Only include image if it exists
            if (formData.image) {
                submitData.image = formData.image;
            }

            if (editingId) {
                // Update existing food
                const response = await axios.put(
                    `${API_BASE_URL}${API_ENDPOINTS.FOOD_UPDATE(editingId)}`,
                    submitData
                );
                if (response.data.success || response.status === 200) {
                    setSuccess("Food item updated successfully!");
                }
            } else {
                // Add new food
                const response = await axios.post(
                    `${API_BASE_URL}${API_ENDPOINTS.FOOD_CREATE}`,
                    submitData
                );
                if (response.data.success || response.status === 201) {
                    setSuccess("Food item added successfully!");
                }
            }
            
            setFormData({ name: "", price: "", image: "", description: "" });
            setEditingId(null);
            setShowForm(false);
            setImagePreview("");
            setIsImageReady(true);
            await fetchFoods();
        } catch (err) {
            console.error("Error:", err);
            setError(err.response?.data?.message || "Error saving food item");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (food) => {
        setFormData({
            name: food.name,
            price: food.price,
            image: food.image, // This will be base64 string
            description: food.description
        });
        setImagePreview(food.image); // Show current image
        setEditingId(food._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                setLoading(true);
                await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.FOOD_DELETE(id)}`);
                setSuccess("Food item deleted successfully!");
                fetchFoods();
            } catch (err) {
                setError(err.response?.data?.message || "Error deleting food item");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleCancel = () => {
        setFormData({ name: "", price: "", image: "", description: "" });
        setImagePreview("");
        setEditingId(null);
        setShowForm(false);
        setError("");
        setIsImageReady(true);
    };

    const handleLogout = () => {
        navigate("/signin");
    };

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>🍽️ Admin Panel - Food Management</h1>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="admin-content">
                <div className="add-section">
                    {!showForm ? (
                        <button onClick={() => setShowForm(true)} className="btn-add">
                            + Add New Food Item
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="food-form">
                            <h2>{editingId ? "Edit Food Item" : "Add New Food Item"}</h2>
                            
                            <div className="form-group">
                                <label htmlFor="name">Food Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter food name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">Price (Rs)</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="Enter price"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="image">Upload Food Image</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    onChange={handleChange}
                                    accept="image/*"
                                    required={!editingId} // Required only when adding new
                                />
                                <p className="file-info">Accepted formats: JPG, PNG, GIF. Max size: 5MB</p>
                                {!isImageReady && !editingId && <p className="file-info" style={{color: '#ff6b6b'}}>Processing image...</p>}
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter food description (optional)"
                                    rows="4"
                                />
                            </div>

                            <div className="form-buttons">
                                <button 
                                    type="submit" 
                                    className="btn-save" 
                                    disabled={loading || (!editingId && !isImageReady)}
                                >
                                    {loading ? "Saving..." : (editingId ? "Update Item" : "Add Item")}
                                </button>
                                <button type="button" onClick={handleCancel} className="btn-cancel">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="food-list-section">
                    <h2>All Food Items ({foods.length})</h2>
                    {loading && <p className="loading">Loading...</p>}
                    
                    <div className="food-list">
                        {foods.map(food => (
                            <div key={food._id} className="food-item">
                                <div className="food-item-image">
                                    <img src={food.image} alt={food.name} />
                                </div>
                                <div className="food-item-details">
                                    <h3>{food.name}</h3>
                                    <p className="price">Rs {food.price}</p>
                                    {food.description && <p className="description">{food.description}</p>}
                                </div>
                                <div className="food-item-actions">
                                    <button 
                                        onClick={() => handleEdit(food)} 
                                        className="btn-edit"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(food._id)} 
                                        className="btn-delete"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Admin;
