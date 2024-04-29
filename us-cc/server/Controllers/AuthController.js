const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const pool = mysql.createPool({
    connectionLimit: 10, // Adjust the limit as per your requirements
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usccdb'
});

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

        connection.query('SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, password], (error, results, fields) => {
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
        const decodedToken = jwt.verify(authToken, secretKey);
        // console.log('Decoded token:', decodedToken);
        return decodedToken;
    } catch (error) {
        console.error('Error decoding token:', error);
        return; 
    }
}

module.exports = { validateCredentials, createUser, decodeToken }
