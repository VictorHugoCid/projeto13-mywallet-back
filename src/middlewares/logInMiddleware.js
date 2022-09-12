import joi from 'joi';
import { db } from '../database/db.js';
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { stripHtml } from 'string-strip-html';


async function logInValidate(req, res, next) {
    const { email, password } = req.body;

    try {
        const user = await db.collection('users').findOne({
            email:stripHtml(email).result.trim(),
        })
        let validate;
        if (user && bcrypt.compareSync(password, user.password)) {
             validate = true
        } else {
            return res.status(404).send('Usuário e/ou senha não encontrada.')
        }



        res.locals.validate = validate
        next()
    } catch (error) {
        console.error(error);
        res.sendStatus(500);

    }
}

export default logInValidate;