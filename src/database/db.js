import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config()

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await mongoClient.connect().then(() => {
    })
} catch (error) {
    console.error(error.message)
}

const db = mongoClient.db('myWallet-1');

export { db } 