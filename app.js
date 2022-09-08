import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import joi from 'joi';
import { stripHtml } from 'string-strip-html';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';


dotenv.config()

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
const mongoClient = new MongoClient(process.env.MONGO_URI);

let db;
mongoClient.connect().then(() => {
    db = mongoClient.db('myWallet-1');
})

// Joi Objects-----------------------------------------



// Sign-Up--------------------------------

app.post('/signUp', async (req, res) => {
    const { username, email, password } = req.body;

    const hashPassword = bcrypt.hashSync(password, 10);

    try {
        await db.collection('users').insertOne({
            username,
            email,
            password: hashPassword,
        })
        res.sendStatus(201)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

// Log-In--------------------------------

app.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({ email })
        const token = uuidv4();
        // if user exist e bcrypt.compare conferir a senha como verdade
        if (user && bcrypt.compareSync(password, user.password)) {

            await db.collection('sessions').insertOne({
                token,
                userId: user._id,
            })

        } else {
            return res.status(404).send('Usuário e/ou senha não encontrada.')
        }

        return res.status(200).send(token);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
})

// Income--------------------------------

app.post('/balance', async (req, res) => {
    const { value, description, type, day } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '')

    try {
        // ----------------------------------------------
        const session = await db.collection('sessions').findOne({
            token,
        })

        if (!session) {
            return res.sendStatus(401);
        }

        const user = await db.collection('users').findOne({
            _id: session.userId,
        })
        // ----------------------------------------------


        db.collection('balance').insertOne({
            value,
            description,
            type,
            day,
            userId: user._id,
        })

        return res.sendStatus(200);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
})

// Outcome--------------------------------

app.post('/balance', async (req, res) => {
    const { value, description, type, day } = req.body;

    try {
        // ----------------------------------------------
        const session = await db.collection('sessions').findOne({
            token,
        })

        if (!session) {
            return res.sendStatus(401);
        }

        const user = await db.collection('users').findOne({
            _id: session.userId,
        })
        // ----------------------------------------------

        db.collection('balance').insertOne({
            userId: user._id,
            value,
            description,
            type,
            day
        })

        return res.sendStatus(200);

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
})

// Home--------------------------------

app.get('/home', async (req, res) => {

    const token = req.headers.authorization?.replace('Bearer ', '');

    try {
        // ----------------------------------------------

        const session = await db.collection('sessions').findOne({
            token,
        })

        if (!session) {
            return res.sendStatus(401);
        }

        const user = await db.collection('users').findOne({
            _id: session.userId,
        })
        // ----------------------------------------------


        const balance = await db.collection('balance').find({
            userId: user._id,
        }).toArray();


        res.status(200).send(balance)
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
})





app.listen(PORT, () => console.log(`Serve is listening in port ${PORT}`))