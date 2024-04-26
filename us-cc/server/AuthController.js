const mysql = require('mysql');

/**
 * 
 * @param {string} username 
 * @param {string} password 
 * @param {(error, userExists)} callback  - Passes back error bool and userExists bool
 */
function validateCredentials(username, password, callback) {
    
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'usccdb'
    });

    connection.connect();

    
    connection.query('SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, password], (error, results, fields) => {
        if (error) {
            connection.end();
            callback(error, null);
            return;
        }
        // Check if user exists
        const userExists = results[0] && results[0].username !== '';

        callback(null, userExists);
        connection.end();
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
    
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'usccdb'
    });

    connection.connect();
    if(username === '' || password === ''){
        callback(1);
        connection.end();
        return;
    }
   
    connection.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, password], (error, results, fields) => {
        if (error) {
            connection.end(); 
            callback(error);
            return;
        }
        console.log("AuthController: Created User!");
        callback(null);
        connection.end(); 
    });
}

module.exports = { validateCredentials, createUser }
