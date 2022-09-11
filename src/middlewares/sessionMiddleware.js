import joi from 'joi';
import { db } from '../database/db.js';

async function validateSession(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '')

    try {
        const session =
            await db.collection('sessions').findOne({
                token,
            })

        if (!session) {
            return res.status(404).send('usuário não está logado.');
        }

        res.locals.session = session;
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}

export default validateSession;