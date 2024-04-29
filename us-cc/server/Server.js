const express = require('express');
const mysql = require('mysql');
const sKey = require('./.env');
const cookie = require('react-cookie');
const { validateCredentials, createUser, getUserData, decodeToken } = require('./AuthController');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
// let [cookies] = cookie.useCookies(['authToken']);
dotenv.config();
const app = express();

/**
 * This file will contain:
 * - Database connection
 * - Routes
 * - API host
 * - API middleware
 * - env variables
 */


app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
}));

/**
 * API Creation
 */
app.use(express.json());

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
            // Assuming you have a function to retrieve user data from the database
            getUserData(username, (userDataError, userData) => {
                if (userDataError) {
                    console.error('Error retrieving user data:', userDataError);
                    res.status(500).send('Error retrieving user data');
                    return;
                }
                    
            

                const key = process.env.JWT_SECRET; //crypto.randomBytes(32); 
                const authToken = jwt.sign({ username, userData }, key, { expiresIn: '14h' });
                // console.log(userData);
                console.log(decodeToken(authToken, key)); //testing to see if we can output the info within token
                // Set authToken as cookie
                res.cookie('authToken', authToken, { httpOnly: true });

                // Respond with success message
                res.status(200).send('Login successful');
            });
            
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
            // console.log("User created successfully");
        });
    });
});


// Route for fetching Incident Reports
app.get('/api/incident-reports', (req, res) => {
    connection.query('SELECT * FROM IncidentReports', (error, results) => {
        if (error) {
            console.error("Error fetching incident reports: ", error);
            res.status(500).send("Error fetching incident reports");
            return;
        }
        res.json(results);
    });
});


/**
 * This route will be used to return user information 
 */
app.get('/api/userinfo', (req,res) => {
    // if(cookies.authToken.length < 1){
    //     res.status(500).send('error in cookie');
    // }
});


/**
 * Return a single user posts
 */
app.get('/api/posts:username', (req, res) => {

    res.json(results);
});

/**
 * Define the port
 * Listen on port 5000
 */
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
