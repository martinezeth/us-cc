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


// Function to get volunteers by region
function getVolunteersByRegion(region, callback) {
    pool.query('CALL GetVolunteersByRegion(?)', [region], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results[0]);
    });
}

// Function to get volunteers by skills
function getVolunteersBySkills(skill, callback) {
    pool.query('CALL GetVolunteersBySkills(?)', [skill], (error, results) => {
        if (error) {
            return callback(error, null);
        }
        callback(null, results[0]);
    });
}
// Route to fetch volunteer data


module.exports = { getUserData, getVolunteersByRegion, getVolunteersBySkills };