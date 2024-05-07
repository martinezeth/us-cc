const mysql = require('mysql');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: './dbConnection.env' });

// const pool = mysql.createPool({
//     connectionLimit: 10,
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'usccdb'
// });


const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


console.log('AuthController.js Database Connection Pool Config:');
console.log('DB Host:', process.env.DB_HOST);
console.log('DB User:', process.env.DB_USER);
console.log('DB Name:', process.env.DB_NAME);

/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @param {(error, userExists)} callback  - Passes back error bool and userExists bool
 */
function validateCredentials(username, password, callback) {
    
    pool.getConnection((err, connection) => {
        if(err){
            callback(err, null);
            return;
        }

        connection.query('SELECT * FROM Users WHERE username = ? AND password_hash = ?', [username, password], (error, results, fields) => {
            if (error) {
                connection.release();
                callback(error, null);
                return;
            }
            // Check if user exists
            const userExists = results[0] && results[0].username !== '';

            callback(null, userExists);
            connection.release();
        });
    });

}


// function validateCredentials(username, password, callback) {
//     pool.getConnection((err, connection) => {
//         if (err) {
//             console.error('Database connection error:', err);
//             callback(err, null);
//             return;
//         }

//         console.log(`Checking credentials for username: ${username}`);
//         connection.query('SELECT * FROM Users WHERE username = ?', [username], (error, results, fields) => {
//             if (error) {
//                 console.error('SQL error:', error);
//                 connection.release();
//                 callback(error, null);
//                 return;
//             }
//             console.log('Query results:', results);
//             if (results.length === 0) {
//                 console.log('No user found with that username.');
//                 callback(null, false);
//                 connection.release();
//                 return;
//             }

//             const userExists = results[0].password_hash === password;  // This assumes passwords are stored in plaintext for now.
//             console.log(`User exists: ${userExists}`);
//             connection.release();
//             callback(null, userExists);
//         });
//     });
// }





/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @param {(createError)} callback 
 * @returns 
 */
function createUser(username, password, callback) {
    
    if(username === '' || password === ''){
        callback(1);
        return;
    }
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err);
            return;
        }
        connection.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, password], (error, results, fields) => {
            if (error) {
                callback(error);
                return;
            }
            // console.log("AuthController: Created User!");
            callback(null);
            connection.release();
        });
    });
}


function decodeToken(authToken, secretKey) {
    try {
        // console.log('Decoded token:', decodedToken);
        return jwt.verify(authToken, secretKey);
    } catch (error) {
        console.error('Error decoding token:', error);
        return; 
    }
}

module.exports = { validateCredentials, createUser, decodeToken }
