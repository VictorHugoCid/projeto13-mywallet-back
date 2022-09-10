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
const signUpSchema = joi.object({
    username: joi.string().required().min(1),
    email: joi.string().email().required().min(1),
    password: joi.string().required().min(6)
})

const signInSchema = joi.object({
    email: joi.string().email().required().min(1),
    password: joi.string().required().min(6),
})

const registerSchema = joi.object({
    userId: joi.string(),
    value: joi.number().required().min(1),
    description: joi.string().required().min(1),
    type: joi.string().required().min(1),
    day: joi.string().required().min(1),
})

// Sign-Up--------------------------------
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    const hashPassword = bcrypt.hashSync(password, 10);

    // validação com joi
    const validation = signUpSchema.validate(req.body)

    if (validation.error) {
        const errors = validation.error.details.map(value => value.message)
        res.status(422).send(errors)
        return;
    }

    try {
        const checkUser = await db.collection('users').findOne({ email })

        if (checkUser) {
            return res.status(409).send('Esse email já está sendo utilizado')
        }
        await db.collection('users').insertOne({
            username: stripHtml(username).result.trim(),
            email: stripHtml(email).result.trim(),
            password: stripHtml(hashPassword).result.trim(),
        })
        res.sendStatus(201)

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

// Log-In--------------------------------
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    // validação com joi
    const validation = signInSchema.validate(req.body)

    if (validation.error) {
        const errors = validation.error.details.map(value => value.message)
        res.status(422).send(errors)
        return;
    }

    try {
        const user = await db.collection('users').findOne({
            email: stripHtml(email).result.trim(),
        })
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

        return res.status(200).send({
            token,
            username: user.username
        });

    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
})

// Income--------------------------------
app.post('/income', async (req, res) => {
    const { value, description, type, day } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '')

    // validação com joi
    const validation = registerSchema.validate(req.body)

    if (validation.error) {
        const errors = validation.error.details.map(value => value.message)
        res.status(422).send(errors)
        return;
    }

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
            value: value,
            description: stripHtml(description).result.trim(),
            type: "income",
            day,
            userId: user._id,
        })

        return res.sendStatus(200);

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
})

// Outcome--------------------------------
app.post('/outcome', async (req, res) => {
    const { value, description, type, day } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');

    // validação com joi
    const validation = registerSchema.validate(req.body)

    if (validation.error) {
        const errors = validation.error.details.map(value => value.message)
        res.status(422).send(errors)
        return;
    }

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
            value: value,
            description: stripHtml(description).result.trim(),
            type: 'outcome',
            day,
            userId: user._id,
        })

        return res.sendStatus(200);

    } catch (error) {
        console.error(error);
        res.status(500).send(user);
    }
})

// Home-GET--------------------------------
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

//  Update------------------------

app.put('/income-update/:id', async (req, res) => {
    const { id } = req.params
    const {value, description} = req.body
    console.log(id)

    const token = req.headers.authorization?.replace('Bearer ', '');


    try {
        const register = await db.collection('balance').findOne({ _id: new ObjectId(id) })

        if (!register) {
            return res.status(404).send('Registro não encontrado')
        }

        await db.collection('balance').updateOne({ _id: new ObjectId(id) }, {
            $set:
                {value,
                description,}
        })

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500);
    }
})

app.put('/outcome-update/:id', async (req, res) => {
    const { id } = req.params
    const {value, description} = req.body

    const token = req.headers.authorization?.replace('Bearer ', '');

    try {
        const register = await db.collection('balance').findOne({ _id: new ObjectId(id) })

        if (!register) {
            return res.status(404).send('Registro não encontrado')
        }

        await db.collection('balance').updateOne({ _id: new ObjectId(id) }, {
            $set:
                {value,
                description,}
        })

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500);
    }
})

//  Delete------------------------
app.delete('/delete/:id', async (req, res) => {
    const { id } = req.params


    try {
        await db.collection('balance').deleteOne({ _id: new ObjectId(id) })

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500);
    }
})

app.listen(PORT, () => console.log(`Serve is listening in port ${PORT}`))