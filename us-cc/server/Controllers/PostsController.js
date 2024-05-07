const mysql = require('mysql');
const jwt = require('jsonwebtoken');


const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
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
            callback(null, results);
            connection.release();

        })
    });
}

function createUserPost(postInfo, callback) {
    const {user_id, title, body, region} = postInfo;
    console.log("po", postInfo);
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query(`INSERT INTO posts (${user_id}, ${title}, ${body}, ${region})`, (error, results, fields) => {
            if (error) {
                connection.release();
                callback(error, null);
                return;
            }
            callback(null, results);
            connection.release();

        })
    });
}

module.exports = { getUserPostData, getRecentPostData, createUserPost }