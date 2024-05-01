const express = require('express');
const mysql = require('mysql');
const { validateCredentials, createUser, decodeToken } = require('./Controllers/AuthController');
const { getUserData, getUserVolunteering, getUserDataUsername, getVolunteersByRegion, getVolunteersBySkills } = require('./Controllers/UserController');
const { getUserPostData, getRecentPostData } = require('./Controllers/PostsController');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
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
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

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
            getUserDataUsername(username, (userDataError, userData) => {
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
    res.clearCookie('authToken', { httpOnly: true });
    res.status(200).send('Logout successful');
});

// REGISTER Route
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

        // If user does not exist, create the user
        createUser(username, password, (createError) => {
            if (createError) {
                console.error('Error creating user:', createError);
                res.status(500).send('Error creating user');
                return;
            }
            res.sendStatus(200);

        });
    });
});

// Incident Reports Route 
app.get('/api/incident-reports', (req, res) => {
    const { swLat, swLng, neLat, neLng } = req.query;
    if (swLat && swLng && neLat && neLng) {
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

// User Info Route
app.get('/api/userinfo/:username', (req, res) => {
    const authToken = req.headers['authorization'];
    const { username } = req.params;

    if (authToken) {

        const decodedToken = decodeToken(authToken, process.env.JWT_SECRET);
        if (decodedToken) {
            getUserDataUsername(username, (error, userData) => {
                if (error) {
                    console.error('Error retrieving user data:', error);
                    res.status(500).send('Error retrieving user data');
                    return;
                }
                res.json(userData);
            });
        } 

    } else {
        res.status(401);
    }
});

// User Posts Route TODO
app.get('/api/posts/:username', (req, res) => {
    const authToken = req.headers['authorization'];

    const decodedToken = decodeToken(authToken, process.env.JWT_SECRET);

    const { username, userData } = decodedToken;
    const user_id = userData[0][0].user_id;

    // Call the function to get post data based on user ID
    getUserPostData(user_id, (error, postData) => {
        if (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        console.log("post data user", postData);

        res.json(postData[0]);
    });
});

app.get('/api/posts', (req, res) => {
    const authToken = req.headers['authorization'];
    // Call the function to get post data based on user ID
    getRecentPostData((error, postData) => {
        if (error) {
            console.error('Error fetching posts:', error);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        console.log("post data all", postData[0]);
        res.json(postData[0]);
    });
});


app.get('/api/volunteering/:username', (req, res) => {
    const { username } = req.params;

    getUserVolunteering(username, (error, volunteeringData) => {
        if (error) {
            console.error('Error fetching volunteering data:', error);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(volunteeringData);
    });
});

// Route to get volunteers by region
app.get('/api/volunteers/region', (req, res) => {
    const { region } = req.query;
    getVolunteersByRegion(region, (err, volunteers) => {
        if (err) {
            res.status(500).send('Failed to fetch volunteers');
        } else {
            res.json(volunteers);
        }
    });
});



// Route to get volunteers by skills
app.get('/api/volunteers/skills', (req, res) => {
    const { skill } = req.query;
    getVolunteersBySkills(skill, (err, volunteers) => {
        if (err) {
            res.status(500).send('Failed to fetch volunteers');
        } else {
            res.json(volunteers);
        }
    });
});

/**
 * Define the PORT
 * Listen on PORT
 */
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
