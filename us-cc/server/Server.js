// const express = require('express');
// const mysql = require('mysql');
// const sKey = require('./jwSec');
// const { validateCredentials, createUser, getUserData, decodeToken } = require('./AuthController');
// const cors = require('cors');
// const app = express();
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');


// /**
//  * This file will contain:
//  * - Database connection
//  * - Routes
//  * - API host
//  */

// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST'],
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));




// // Place this right after your existing CORS configuration in server.js

// // app.use((req, res, next) => {
// //     console.log('CORS Headers:', req.headers.origin); // Logs the origin of every request
// //     next();
// // });

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
//     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//     res.header('Access-Control-Allow-Credentials', true);
//     next();
// });


// // // Route for fetching Incident Reports
// // app.get('/api/incident-reports', (req, res) => {
// //     console.log("Access attempt from:", req.headers.origin); // This will log the origin attempting to access this route
// //     connection.query('SELECT * FROM IncidentReports', (error, results) => {
// //         if (error) {
// //             console.error("Error fetching incident reports: ", error);
// //             res.status(500).send("Error fetching incident reports");
// //             return;
// //         }
// //         res.json(results);
// //     });
// // });


// // Temporarily modified route for testing
// app.get('/api/incident-reports', (req, res) => {
//     res.json({ message: "Endpoint reached successfully" });
// });


// /**
//  * Database connection
//  */
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'usccdb'
// });

// connection.connect(err => {
//     if (err) {
//         console.error('Error connecting to database: ', err);
//         return;
//     }
//     console.log('Connected to database.');
// });


// /**
//  * API Creation
//  */
// app.use(express.json());

// /**
//  * Routes
//  */

// // LOGIN Route
// app.post('/api/login', (req, res) => {
//     const { username, password } = req.body;

//     validateCredentials(username, password, (error, userExists) => {
//         if (error) {
//             console.error('Error validating credentials:', error);
//             res.status(500).send('Error validating credentials');
//             return;
//         }
//         if (userExists) {
//             // Assuming you have a function to retrieve user data from the database
//             getUserData(username, (userDataError, userData) => {
//                 if (userDataError) {
//                     console.error('Error retrieving user data:', userDataError);
//                     res.status(500).send('Error retrieving user data');
//                     return;
//                 }
                    
            

//                 const key = sKey;//crypto.randomBytes(32);
//                 const authToken = jwt.sign({ username, userData }, key, { expiresIn: '14h' });
//                 // console.log(userData);
//                 console.log(decodeToken(authToken, key));
//                 // Set authToken as cookie
//                 res.cookie('authToken', authToken, { httpOnly: true });

//                 // Respond with success message
//                 res.status(200).send('Login successful');
//             });
            
//         } else {
//             res.status(401).send('Invalid username or password');
//         }
//     });
// });

// // REGISTER Route
// app.post('/api/register', (req, res) => {
//     const { username, password } = req.body;
//     validateCredentials(username, password, (error, userExists) => {
//         if (error) {
//             // Some error occurs
//             console.error('Error validating credentials:', error);
//             res.status(500).send('Internal Server Error');
//             return;
//         }
//         if (userExists) {
//             // User already exists, respond with 409 Conflict
//             // res.status(409).send('Username already exists');
//             console.log("User exists already");
//             return;
//         }

//         // If user does not exist, create the user
//         createUser(username, password, (createError) => {
//             if (createError) {
//                 console.error('Error creating user:', createError);
//                 res.status(500).send('Error creating user');
//                 return;
//             }
//             // User created successfully
//             // res.status(200).send('User created successfully');
//             // console.log("User created successfully");
//         });
//     });
// });


// // // Route for fetching Incident Reports
// // app.get('/api/incident-reports', (req, res) => {
// //     connection.query('SELECT * FROM IncidentReports', (error, results) => {
// //         if (error) {
// //             console.error("Error fetching incident reports: ", error);
// //             res.status(500).send("Error fetching incident reports");
// //             return;
// //         }
// //         res.json(results);
// //     });
// // });


// /**
//  * Define the port
//  * Listen on port 5000
//  */
// const PORT = 5000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });



const express = require('express');
const mysql = require('mysql');
const sKey = require('./jwSec');
const { validateCredentials, createUser, getUserData, decodeToken } = require('./AuthController');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// Setup CORS correctly
app.use(cors({
    origin: 'http://localhost:3000',  // Frontend server
    methods: ['GET', 'POST', 'OPTIONS'],  // Allowed methods
    credentials: true,  // To allow cookies
    allowedHeaders: ['Content-Type', 'Authorization']
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
                const authToken = jwt.sign({ username, userData }, key, { expiresIn: '14h' });
                res.cookie('authToken', authToken, { httpOnly: true });
                res.status(200).send('Login successful');
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
 * Define the port
 * Listen on port 5000
 */
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});