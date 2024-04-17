import { createConnection } from 'mysql';

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