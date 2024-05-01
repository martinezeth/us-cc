const express = require('express');
const mysql = require('mysql');
const sKey = require('./jwSec');
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


const dotenv = require('dotenv');
dotenv.config();

// Setup CORS correctly
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
            getUserData(username, (userDataError, userData) => {
                if (userDataError) {
                    console.error('Error retrieving user data:', userDataError);
                    res.status(500).send('Error retrieving user data');
                    return;
                }
                const key = sKey;

                const key = process.env.JWT_SECRET;
                const authToken = jwt.sign({ username, userData }, key, { expiresIn: '14h' });
                res.cookie('authToken', authToken, { httpOnly: true });
                res.status(200).send('Login successful');

                // Send the authToken in the response
                res.send({ authToken: authToken });
            });
        } else {
            res.status(401).send('Invalid username or password');
        }
    });
});

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    validateCredentials(username, password, (error, userExists) => {
        if (error) {
            console.error('Error validating credentials:', error);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (userExists) {
            console.log("User exists already");
            return;
        }
        createUser(username, password, (createError) => {
            if (createError) {
                console.error('Error creating user:', createError);
                res.status(500).send('Error creating user');
                return;
            }
        });
    });
});

<<<<<<< HEAD
// Incident Reports Route 
=======
// Route for fetching Incident Reports
// app.get('/api/incident-reports', (req, res) => {
//     connection.query('SELECT * FROM IncidentReports', (error, results) => {
//         if (error) {
//             console.error("Error fetching incident reports: ", error);
//             res.status(500).send("Error fetching incident reports");
//             return;
//         }
//         res.json(results);
//     });
// });

>>>>>>> 59fc4fb (Finished map view.)
app.get('/api/incident-reports', (req, res) => {
    const { swLat, swLng, neLat, neLng } = req.query;
    if(swLat && swLng && neLat && neLng) {
        connection.query(
            'SELECT * FROM IncidentReports WHERE location_lat BETWEEN ? AND ? AND location_lng BETWEEN ? AND ?',
            [parseFloat(swLat), parseFloat(neLat), parseFloat(swLng), parseFloat(neLng)],
            (error, results) => {
                if (error) {
                    console.error("Error fetching incident reports: ", error);
                    res.status(500).send("Error fetching incident reports");
                    return;
                }
                res.json(results);
            }
        );
    } else {
        connection.query('SELECT * FROM IncidentReports', (error, results) => {
            if (error) {
                console.error("Error fetching incident reports: ", error);
                res.status(500).send("Error fetching incident reports");
                return;
            }
            res.json(results);
        });
    }
});

<<<<<<< HEAD
// User Info Route
app.get('/api/userinfo/:username', (req,res) => {
    const { authToken } = req.headers;
    const { username } = req.params;

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
=======
>>>>>>> 59fc4fb (Finished map view.)

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
