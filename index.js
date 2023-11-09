const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const mongoose = require('mongoose');

// Read .env file
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

app.use(express.json());

// User Registration
app.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).send('User registered');
});

// User Login
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user._id }, 'your_secret_key', { expiresIn: '1d' });
        res.status(200).json({ token });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('new_order', (data) => {
        io.emit('new_order', data);
    });
});

http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


const cors = require('cors');
app.use(cors());