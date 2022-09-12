import joi from 'joi';
import { ObjectId } from 'mongodb';
import { db } from '../database/db.js';

async function validateRegister(req, res, next) {

    const { id } = req.params
    console.log(req.params)

    // const { token } = req.headers.authorization?.replace('Bearer ', '')

    try {
        const register =
            await db.collection('balance').findOne({
                _id: new ObjectId(id),
            })
            console.log(register)

            if(!register){
                return res.status(404).send('Registro não encontrado.');
            }

            res.locals.register = register;
            next();
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}

export default validateRegister;