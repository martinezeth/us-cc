const express = require('express');
const mysql = require('mysql');
const { validateCredentials } = require('./AuthController');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usccdb'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to database: ', err);
        return;
    }
    console.log('Connected to database.');
});

app.use(express.json());

// LOGIN Route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    validateCredentials(username, password, (error, userExists) => {
        if (error) {
            console.error('Error validating credentials:', error);
            res.status(500).send('Error validating credentials');
            return;
        }
        if (userExists) {
            const key = crypto.randomBytes(32);
            const authToken = jwt.sign({username}, key, {expiresIn: '14h'} );
            res.cookie('authToken', authToken, {httpOnly: true});
            res.status(200).send('Login successful');
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});

// REGISTER Route
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    validateCredentials(username, password, (error, userExists) => {
        if (error) {
            // Handle error
            console.error('Error validating credentials:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (userExists) {
            // User already exists, respond with 409 Conflict
            res.status(409).send('Username already exists');
            return;
        }

        // If user does not exist, create the user
        createUser(username, password, (createError) => {
            if (createError) {
                // Handle error creating user
                console.error('Error creating user:', createError);
                res.status(500).send('Error creating user');
                return;
            }
            // User created successfully
            res.status(200).send('User created successfully');
        });
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
