const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/users', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Schema with notes
const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    notes: { type: String, default: '' }, // Default notes field as an empty string
});

const User = mongoose.model('User', userSchema);

// Registration route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        notes: '', // Initialize notes as empty
    });

    try {
        await newUser.save();
        req.session.user = { email }; // Start session
        res.json({ success: true });
    } catch (err) {
        console.error('Registration error:', err);
        res.json({ success: false, message: 'Error registering user. Email may already be in use.' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { email }; // Start session
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid email or password' });
    }
});

// Dashboard route (Serves the dashboard page)
app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
    } else {
        res.redirect('/');
    }
});

// Get user's notes
app.get('/get-notes', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    try {
        const user = await User.findOne({ email: req.session.user.email });
        if (user) {
            res.json({ success: true, notes: user.notes });
        } else {
            res.json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Error retrieving notes:', err);
        res.status(500).json({ success: false, message: 'Error retrieving notes' });
    }
});

// Save user's notes
app.post('/save-notes', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { notes } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { email: req.session.user.email },
            { $set: { notes } },
            { new: true } // Return updated document
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error saving notes:', err);
        res.status(500).json({ success: false, message: 'Error saving notes' });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error logging out' });
        }
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});