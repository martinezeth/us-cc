const mysql = require('mysql');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS
});


/**
 * Fetch all incident reports from the database.
 */
const fetchIncidents = (callback) => {
    pool.getConnection((err, connection) => {
    if(err) {
        callback(err, null);
        return;
    }
        connection.query('SELECT * FROM IncidentReports', (error, results) => {
                if (error) {
                    console.error("Error fetching incident reports: ", error);
                    return callback(error, null);
                }
                callback(null, results);
                connection.release();
        });
    });
    
};

module.exports = { fetchIncidents };