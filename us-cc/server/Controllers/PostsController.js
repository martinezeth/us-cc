const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const pool = mysql.createPool({
    connectionLimit: 10, 
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usccdb'
});

function getPostData(user_id, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query('SELECT * FROM posts WHERE user_id = ?', [user_id], (error, results, fields) => {
            if (error) {
                connection.release();
                callback(error, null);
                return;
            }
            // console.log("Got post info: ", results);
            callback(null, results);
            connection.release();

        })
    });
}

module.exports = {getPostData}