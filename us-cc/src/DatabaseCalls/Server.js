import express from 'express';
import db from './ConnectToDatabase'; // Import the database connection object

const dataRouter = express.Router();

dataRouter.get('/', (req, res) => {
    res.send('data fetched from db');
});

const app = express();
const port = 3001;

app.use('/api/data', dataRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// TODO: Nic finish this
export function AuthUserLogin(username, password) {
    return false;
}