const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require("path");
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/signupform', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log("Connection successful");
})
.catch((err) => {
    console.error("Connection failed!", err);
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname,'../public', 'index.html'));
});
// Define the route for the signup form
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).send('User registered successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/login', (req, res) => {
    const loginPath = path.join(__dirname, '../public', 'login.html');
    res.sendFile(loginPath);
});app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).send('Invalid username or password');
        }

        if ('password' in user && password === user.password) {
            const token = jwt.sign({ userId: user._id }, 'your-secret-key');

            // Return the token in the response
            return res.json({ token });
        }

        return res.status(401).send('Invalid username or password');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




const verifyToken = (req, res, next) => {
    const token = req.query.token || req.header('Authorization');
    console.log('Token:', token);  // Add this line

    if (!token) return res.status(401).send('Access denied. No token provided.');

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);  // Add this line
            return res.status(401).send('Invalid token.');
        }
        req.userId = decoded.userId;
        console.log('Decoded user ID:', req.userId);  // Add this line
        next();
    });
};
// Retrieve user profile
// Retrieve user profile
// Retrieve user profile
app.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId, { password: 0 });
        if (!user) {
            return res.status(404).send('User not found.');
        }

        // Return the user profile as JSON
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Update user profile
app.put('/profile', verifyToken, async (req, res) => {
    const { username, email } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { username, email },
            { new: true, fields: { password: 0 } }
        );

        if (!updatedUser) {
            return res.status(404).send('User not found.');
        }

        // Return the updated user profile as JSON
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});