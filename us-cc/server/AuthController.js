const mysql = require('mysql');

// Function to validate user credentials
function validateCredentials(username, password, callback) {
    // Connect to the database
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'usccdb'
    });

    connection.connect();

    // Perform query to check if username and password match
    connection.query('SELECT * FROM users WHERE username = ? AND password_hash = ?', [username, password], (error, results, fields) => {
        if (error) {
            connection.end(); // Close the connection in case of an error
            callback(error, null);
            return;
        }
        // Check if user exists
        const userExists = results.length > 0;
        callback(null, userExists);
        connection.end(); // Close the connection after the query is completed
    });
}

module.exports = { validateCredentials };
