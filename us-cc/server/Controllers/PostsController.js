const mysql = require('mysql');
const jwt = require('jsonwebtoken');


const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usccdb'
});

function getUserPostData(user_id, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query('CALL GetUserPosts(?)', [user_id], (error, results, fields) => {
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

function getRecentPostData(callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query('CALL GetRecentPosts()', (error, results, fields) => {
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

module.exports = { getUserPostData, getRecentPostData }