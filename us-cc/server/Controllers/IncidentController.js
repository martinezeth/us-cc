const mysql = require('mysql');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
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


const createIncidentReport = (incidentData, callback) => {
    const { user_id, incident_type, description, location_lat, location_lng } = incidentData;
    console.log('Received incident data:', incidentData);
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Database connection error:', err);
            callback(err, null);
            return;
        }
        const query = `
            INSERT INTO IncidentReports (user_id, incident_type, description, location_lat, location_lng)
            VALUES (?, ?, ?, ?, ?);
        `;
        connection.query(query, [user_id, incident_type, description, parseFloat(location_lat), parseFloat(location_lng)], (error, results) => {
            connection.release();
            if (error) {
                console.error('SQL error inserting incident report:', error);
                callback(error, null);
                return;
            }
            callback(null, results.insertId); // Returns the ID of the newly created incident report
        });
    });
};

const incidentsByRadius = (bounds, callback) => {
    pool.getConnection((error, connection) => {
        if(error){
            callback(error, null);
            return;
        }
        connection.query('SELECT * FROM IncidentReports WHERE location_lat BETWEEN ? AND ? OR location_lng BETWEEN ? AND ?',
        [bounds.minLat, bounds.maxLat, bounds.minLng, bounds.maxLng],
        (error, results) => {
            connection.release();
            if (error) {
                console.error("Error fetching incident reports: ", error);
                callback(error, null);
                return;
            }
            callback(null, results);
            return;
        }
    );
    })

}

module.exports = { fetchIncidents, createIncidentReport, incidentsByRadius};