const mysql = require('mysql');
require('dotenv').config({ path: './dbConnection.env' });


const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


function getUserDataUsername(username, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query('CALL GetUserInfoUsername(?)', [username], (error, results, fields) => {
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

function getUserData(user_id, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query(`CALL GetUserInfo(?)`, [user_id], (error, results, fields) => {
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

// Function to get where a user volunteers
function getUserVolunteering(username, callback){
    pool.getConnection((err, connection) => {
        if(err){
            callback(err, null)
            return;
        }
        connection.query(`CALL GetUserVolunteering(?)`, [username], (error, results, fields) => {
            if(error){
                connection.release();
                callback(error, null);
                return;
            }
            callback(null, results);
            connection.release();
        });
    });
}


// Function to get volunteers by region
function getVolunteersByRegion(region, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }

        connection.query('CALL GetVolunteersByRegion(?)', [region], (error, results, fields) => {
            connection.release();

            if (error) {
                callback(error, null);
                return;
            }

            callback(null, results[0]);
        });
    });
}

// Function to get volunteers by skills
function getVolunteersBySkills(skill, callback) {
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }

        connection.query('CALL GetVolunteersBySkills(?)', [skill], (error, results, fields) => {
            connection.release();

            if (error) {
                callback(error, null);
                return;
            }

            callback(null, results[0]);
        });
    });
}

function makeUserVolunteer(userData, callback) {
    const { name, region, region_id, skills, availability } = userData;

    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query('CALL AddUserAsVolunteer(?, ?, ?, ?, ?)', [name, region, region_id, skills, availability], (error, results, fields) => {
            connection.release();
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, results);
        });
    });
}

function getRegions(callback){
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }

        connection.query('SELECT region_id, region_name FROM Region', (error, results, fields) => {
            connection.release();

            if (error) {
                callback(error, null);
                return;
            }
            callback(null, results);
        });
    });
}


module.exports = { getUserData, 
                   getUserDataUsername, 
                   getUserVolunteering, 
                   getVolunteersByRegion, 
                   getVolunteersBySkills, 
                   makeUserVolunteer,
                   getRegions };