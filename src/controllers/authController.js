import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../database/db.js";
import { stripHtml } from 'string-strip-html';


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

async function createParticipant(req, res) {
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
}

async function logInParticipant (req, res) {
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
}

export{
    createParticipant,
    logInParticipant,
}