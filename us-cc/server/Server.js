const express = require('express');
const mysql = require('mysql');
const sKey = require('./.env');
const cookie = require('react-cookie');
const { validateCredentials, createUser, decodeToken } = require('./Controllers/AuthController');
const { getUserData } = require('./Controllers/UserController');
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

                const key = process.env.JWT_SECRET;
                const authToken = jwt.sign({ username, userData }, key, { expiresIn: '14h' });

                // Send the authToken in the response
                res.send({ authToken: authToken });
            });
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});


app.post('/api/logout', (req, res) => {
    // Clear the authToken cookie
    res.clearCookie('authToken', { httpOnly: true });

    // Respond with a success message
    res.status(200).send('Logout successful');
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


// Incident Reports Route 
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


// User Info Route
app.get('/api/userinfo/:username', (req,res) => {
    const { authToken } = req.headers;
    const { username } = req.params;
    console.log("userinfo headers:", req.headers);
    if (authToken) {
        
        const decodedToken = decodeToken(authToken);
        console.log("decoded: ", decodedToken);
        if (username) {
            
            getUserData(username, (error, userData) => {
                if (error) {
                    console.error('Error retrieving user data:', error);
                    res.status(500).send('Error retrieving user data');
                    return;
                }

                
                res.json(userData);
            });
        } else {
            
            const currentUser = decodedToken.username; 
            getUserData(currentUser, (error, userData) => {
                if (error) {
                    console.error('Error retrieving user data:', error);
                    res.status(500).send('Error retrieving user data');
                    return;
                }


                res.json(userData);
            });
           
        }
    } else {
        // If authToken is not provided in the request headers
        res.status(401).send('Unauthorized');
    }
});

// User Posts Route
app.get('/api/posts/:username', (req, res) => {

    res.json(results);
});

/**
 * Functions
 */

function authenticateToken(req, res, nex) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token === null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}



/**
 * Define the PORT
 * Listen on PORT
 */
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
