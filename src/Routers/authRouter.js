import express from 'express';
import * as authController from '../controllers/authController.js'
import userAlreadyExist from '../middlewares/singUpMiddleware.js'
import logInValidate from '../middlewares/logInMiddleware.js'
const router = express.Router();

router.post('/signup', userAlreadyExist, authController.createParticipant)
router.post('/signin', /* logInValidate, */ authController.logInParticipant)

// tem q ser export default
export default router;
