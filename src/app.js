import express from 'express';
import cors from 'cors';

import {createParticipant, logInParticipant} from './controllers/authController.js';

import { createRegister, readBalance,updateRegister, deleteRegister} from './controllers/balanceController.js'



const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Sign-Up--------------------------------
app.post('/signup', createParticipant)

// Log-In--------------------------------
app.post('/signin', logInParticipant)

//  createRegister------------------------
app.post('/createRegister', createRegister)

// Home-GET--------------------------------
app.get('/home', readBalance)

//  Update------------------------
app.put('/updateRegister/:id', updateRegister)

//  Delete------------------------
app.delete('/delete/:id', deleteRegister)

app.listen(PORT, () => console.log(`Serve is listening in port ${PORT}`))