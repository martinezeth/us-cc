const express = require('express');
const mysql = require('mysql');
const { validateCredentials, createUser, getUserData, decodeToken } = require('./Controllers/AuthController');
const { getVolunteersByRegion, getVolunteersBySkills } = require('./Controllers/UserController');
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

// Endpoint for getting number of volunteers by region
app.get('/api/volunteers/region-chart', (req, res) => {
    connection.query('SELECT region, COUNT(*) AS count FROM Volunteers GROUP BY region', (error, results) => {
        if (error) {
            console.error('Error fetching aggregated volunteers:', error);
            res.status(500).send('Error fetching data');
            return;
        }
        res.json(results);
    });
});


// Endpoint for getting number of volunteers by skill
app.get('/api/volunteers/skill-chart', (req, res) => {
    connection.query('SELECT skills, COUNT(*) AS count FROM Volunteers GROUP BY skills', (error, results) => {
        if (error) {
            console.error('Error fetching aggregated volunteers:', error);
            res.status(500).send('Error fetching data');
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