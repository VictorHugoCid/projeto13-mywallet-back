import joi from 'joi';
import { db } from '../database/db.js';

async function userAlreadyExist(req, res, next) {
    const { username, email, password } = req.body;


    try {
        const checkUser = await db.collection('users').findOne({ email })

        if(checkUser){
            return res.status(409).send('Esse email já está sendo utilizado')
        }

        res.locals.user = checkUser
        next();
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

export default userAlreadyExist;