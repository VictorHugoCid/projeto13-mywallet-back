import { db } from '../database/db.js';
import joi from "joi";
import { stripHtml } from 'string-strip-html';
import { ObjectId } from 'mongodb';

// joi Object
const registerSchema = joi.object({
    userId: joi.string(),
    value: joi.number().required().min(1),
    description: joi.string().required().min(1),
    type: joi.string().required().min(1),
    day: joi.string().required().min(1),
})

//  create------------------------------
async function createRegister(req, res) {
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
            type,
            day,
            userId: user._id,
        })

        return res.sendStatus(200);

    } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
}

// read------------------------------------

async function readBalance(req, res) {

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
}

// update---------------------------------
async function updateRegister(req, res) {
    const { id } = req.params
    const { value, description } = req.body

    const token = req.headers.authorization?.replace('Bearer ', '');


    try {
        const register = await db.collection('balance').findOne({ _id: new ObjectId(id) })

        if (!register) {
            return res.status(404).send('Registro não encontrado')
        }

        await db.collection('balance').updateOne({ _id: new ObjectId(id) }, {
            $set:
            {
                value,
                description,
            }
        })

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500);
    }
}

// delete---------------------------------

async function deleteRegister(req, res) {
    const { id } = req.params
    console.log(id)


    try {
        await db.collection('balance').deleteOne({ _id: new ObjectId(id) })

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500);
    }
}

export {
    createRegister,
    readBalance,
    updateRegister,
    deleteRegister
}