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

function getIDFromUsername(username){
    console.log("user", username);
    pool.getConnection((err, connection) => {
        if(err){
            connection.release();
            console.error("Error connection to database. UserController::getIDFromUserName");
            return;
        }
        connection.query(`SELECT user_id FROM Users WHERE username = ?`, [username], (err, results) => {
            connection.release();
            if(err){
                connection.release();
                console.log("error selecting user id. UserController::getIDFromUserName");
                return;
            }
            console.log("aa", results[0].user_id);
            return results[0].user_id;
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

function updateUserInformation(userInfo, callback){
    const { userid, newUsername, newName, newPassword } = userInfo;
    const values = [];
    let sql = 'CALL UpdateUser(?)'; 
    values.push(userid !== null ? userid : null);
    values.push(newName !== null ? newName : null);
    values.push(newUsername !== null ? newUsername : null)
    values.push(newPassword !== null ? newPassword : null);
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query(sql, [values], (error, results) => {
            connection.release();
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, results);
        });
    });
    
};

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
    const { name, region, regionid, skills, availability } = userData;
    if (!validateSkillsFormat(skills)) {
        callback('Invalid skills format', null);
        return;
    }
    pool.getConnection((err, connection) => {
        if (err) {
            callback(err, null);
            return;
        }
        connection.query('CALL AddUserAsVolunteer(?, ?, ?, ?, ?)', [name, region, regionid, skills, availability], (error, results, fields) => {
            connection.release();
            if (error) {
                callback(error, null);
                return;
            }
            callback(null, results);
        });
    });
}

function validateSkillsFormat(skills) {
    if (typeof skills !== 'string' || skills.trim() === '') {
        return false;
    }

    const MAX_SKILLS_LENGTH = 255;

    const normalizedSkills = skills.split(',').map(skill => skill.trim());

   if (skills.length > MAX_SKILLS_LENGTH) {
        return false;
    }

    // Validate that skills field is not empty after normalization
    if (normalizedSkills.length < 1) {
        return false;
    }

    // Validate character set (allow letters, numbers, spaces, and commas)
    const allowedCharactersRegex = /^[a-zA-Z0-9\s,]*$/;
    if (!allowedCharactersRegex.test(skills)) {
        return false;
    }

    return true;
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
                   updateUserInformation,
                   getIDFromUsername,
                   getUserDataUsername, 
                   getUserVolunteering, 
                   getVolunteersByRegion, 
                   getVolunteersBySkills, 
                   makeUserVolunteer,
                   getRegions };