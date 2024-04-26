const express = require('express');
const mysql = require('mysql');
const { validateCredentials, createUser } = require('./AuthController');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


/**
 * This file will contain:
 * - Database connection
 * - Routes
 * - API host
 */





app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

/**
 * Database connection
 */
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


/**
 * API Creation
 */
app.use(express.json());

/**
 * Routes
 */



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
            // Some error occurs
            console.error('Error validating credentials:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (userExists) {
            // User already exists, respond with 409 Conflict
            // res.status(409).send('Username already exists');
            console.log("User exists already");
            return;
        }

        // If user does not exist, create the user
        createUser(username, password, (createError) => {
            if (createError) {
                console.error('Error creating user:', createError);
                res.status(500).send('Error creating user');
                return;
            }
            // User created successfully
            // res.status(200).send('User created successfully');
            console.log("User created successfully");
        });
    });
});


/**
 * Define the port
 * Listen on port 5000
 */
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
