import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './user.js';
import Food from './food.js';

const app = express();
const port = 3000;

// Use MongoDB container name for Docker, localhost for local development
const mongoURI = process.env.MONGODB_URI || 'mongodb://mongo:27017/database';

mongoose.connect(mongoURI).then(() => {
    console.log('Successfully connected to MongoDB');
}).catch(err => {
    console.error('Connection error', err);
    process.exit();
});

app.use(cors());
// Increase JSON payload limit to 50MB for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running', status: 'ok' });
});

app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already taken', success: false });
        }

        const user = new User({ username, password });
        await user.save();

        res.status(201).json({ message: 'Sign up successful', success: true, user: { username: user.username, id: user._id }});
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error signing up', success: false });
    }
});


app.post('/signin', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const user = await User.findOne({
           username: username,
           password: password,
        });

        if (user) {
            res.status(200).json({ message: 'Sign in successful', success: true, user: { username: user.username, id: user._id } });
        } else {
            res.status(401).json({ message: 'Invalid credentials', success: false });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error signing in', success: false });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    try {
        // Clear session/token (in this simple example, just send success)
        // In production, you'd invalidate JWT tokens or clear sessions
        res.json({ message: 'Logout successful' });
    } catch (e) {
        console.error(e);
        res.status(500).send('Error logging out');
    }
});

// ============ FOOD CRUD APIs ============

// Get all food items
app.get('/food', async (req, res) => {
    try {
        const foods = await Food.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: foods });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching food items', success: false });
    }
});

// Get single food item
app.get('/food/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Food item not found', success: false });
        }
        res.status(200).json({ success: true, data: food });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error fetching food item', success: false });
    }
});

// Add new food item
app.post('/food', async (req, res) => {
    try {
        const { name, price, image, description } = req.body;

        if (!name || !price || !image) {
            return res.status(400).json({ message: 'Name, price, and image are required', success: false });
        }

        const food = new Food({
            name,
            price: parseFloat(price),
            image,
            description: description || ''
        });

        await food.save();
        res.status(201).json({ message: 'Food item added successfully', success: true, data: food });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error adding food item', success: false });
    }
});

// Update food item
app.put('/food/:id', async (req, res) => {
    try {
        const { name, price, image, description } = req.body;

        if (!name || !price || !image) {
            return res.status(400).json({ message: 'Name, price, and image are required', success: false });
        }

        const food = await Food.findByIdAndUpdate(
            req.params.id,
            {
                name,
                price: parseFloat(price),
                image,
                description: description || ''
            },
            { new: true }
        );

        if (!food) {
            return res.status(404).json({ message: 'Food item not found', success: false });
        }

        res.status(200).json({ message: 'Food item updated successfully', success: true, data: food });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error updating food item', success: false });
    }
});

// Delete food item
app.delete('/food/:id', async (req, res) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);

        if (!food) {
            return res.status(404).json({ message: 'Food item not found', success: false });
        }

        res.status(200).json({ message: 'Food item deleted successfully', success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Error deleting food item', success: false });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});
