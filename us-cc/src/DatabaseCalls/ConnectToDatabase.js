import express from 'express';
import cors from 'cors';
import { createPool } from 'mysql';

var db = createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'usccdb'
});

const app = express();

app.use(cors());

app.post('/signup', (req, res) => {

});