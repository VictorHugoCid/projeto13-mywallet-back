import express from 'express';
import cors from 'cors';

import authRouter from './Routers/authRouter.js'
import balanceRouter from './Routers/balanceRouter.js'

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// participantRouters
app.use(authRouter)

// balanceRouters
app.use(balanceRouter)

app.listen(PORT, () => console.log(`Serve is listening in port ${PORT}`))



