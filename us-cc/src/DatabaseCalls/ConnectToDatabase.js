import express from 'express';
import cors from 'cors';
import { createPool } from 'mysql';

const db = createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : 'root',
    database        : 'usccdb'
});

export default db;