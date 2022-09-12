import express from 'express';
import * as balanceController from '.././controllers/balanceController.js'
import validateSession from '.././middlewares/sessionMiddleware.js';
import validateRegister from '../middlewares/registerMiddleware.js';


const router = express.Router();

router.post('/createRegister', validateSession, balanceController.createRegister)

router.get('/home', validateSession, balanceController.readBalance)

router.put('/updateRegister/:type/:id',validateRegister, balanceController.updateRegister)

router.delete('/deleteRegister/:id',validateRegister, balanceController.deleteRegister)

export default router;