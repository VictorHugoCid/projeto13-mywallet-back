import express from 'express';
import * as authController from '../controllers/authController.js'
import userAlreadyExist from '../middlewares/singUpMiddleware.js'
import logInValidate from '../middlewares/logInMiddleware.js'
import validateSession from '../middlewares/sessionMiddleware.js';
const router = express.Router();

router.post('/signup', userAlreadyExist, authController.createParticipant)
router.post('/signin', /* logInValidate, */ authController.logInParticipant)
router.delete('/logOut',validateSession, authController.logOutParticipant )

// tem q ser export default
export default router;
