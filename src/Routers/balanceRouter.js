import express from 'express';
import * as balanceController from '.././controllers/balanceController.js'

const router = express.Router();

router.post('/createRegister', balanceController.createRegister)
router.get('/home', balanceController.readBalance)
router.put('/updateRegister', balanceController.updateRegister)
router.delete('/deleteRegister/:id', balanceController.deleteRegister)

export default router;