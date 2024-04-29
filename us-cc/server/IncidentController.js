const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 10, // Adjust the limit as per your requirements
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'usccdb'
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