const express = require('express');
const bodyParser = require('body-parser');
import { createPool } from 'mysql';
import cors from 'cors';
const db = createPool({host: 'localhost', user: 'root', password: 'root', database: 'usccdb' });
const port = 8000;

const app = express();
app.use(cors());

app.get('/', (req, res)=> {
    db.getConnection()
    .then(conn => {
        conn.query("SELECT * FROM USERS")
            .then((result) => {
                console.log(result);
                conn.end();
                res.json({data: result, success: true});
            })
            .catch(err => {
                console.log(err);
                conn.end();
                res.json({error: err, success: false});
            })
    }) .catch(err => {
        console.log(err);
        res.json({error: err, success: false});
    });
})


app.get('/api/users', (req,res) => {
    db.query(`select * from users`, (err, rows) => {
        if(err) {
            res.send(err);
        }
        else {
            res.send(rows);
        }
    });
});

// // Function to authenticate user login
// export function AuthUserLogin(username, password, callback) {
//     const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
//     db.query(sql, [username, password], (err, result) => {
//         if (err) {
//             console.error("Error authenticating user:", err);
//             callback(false);
//         } else {
//             // If user is found, result will contain user data
//             if (result.length > 0) {
//                 callback(true); // Pass user data to callback function
//             } else {
//                 callback(false); // User not found
//             }
//         }
//     });
// }


// // Function to get user data by user ID
// export function GetUserDataById(userId, callback) {
//     const sql = 'SELECT * FROM users WHERE id = ?';
//     db.query(sql, [userId], (err, result) => {
//         if (err) {
//             console.error("Error fetching user data:", err);
//             callback(null);
//         } else {
//             if (result.length > 0) {
//                 callback(result[0]); // Pass user data to callback function
//             } else {
//                 callback(null); // User not found
//             }
//         }
//     });
// }

// // Define route to fetch data from the database
// app.get('/api/data', (req, res) => {
//     res.send('Data fetched from database');
// });

// app.post('/api/login', (req, res) => {
//     const {username, password } = req.body;
//     console.log("Got into the app post!");
//     AuthUserLogin(username, password, (success) => {
//         if(success) {
//             res.json({success: true});
//         }
//         else {
//             res.json({success: false});
//         }
//     });
// });
app.listen(port, () => console.log(`Project running on port ${port}`));