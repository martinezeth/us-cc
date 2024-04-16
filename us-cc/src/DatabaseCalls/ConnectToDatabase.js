import express from 'express';
import { createConnection } from 'mysql';

const app = express();

const db = createConnection({
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'usccdb'
});

db.connect(err => {
    if(err){
        throw err;
    }
    console.log("connected to db");
});


export default db;