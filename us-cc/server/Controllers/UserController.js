const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const pool = mysql.createPool({
    connectionLimit: 10, 
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usccdb'
});

function getUserData(username, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query('SELECT * FROM users WHERE username = ?', [username], (error, results, fields) => {
            if (error) {
                connection.release();
                callback(error, null);
                return;
            }
            // console.log("Got user info: ", results);
            callback(null, results);
            connection.release();

        })
    });
}

module.exports = {getUserData}