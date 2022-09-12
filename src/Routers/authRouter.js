import express from 'express';
import * as authController from '../controllers/authController.js'
import userAlreadyExist from '../middlewares/singUpMiddleware.js'
import logInValidate from '../middlewares/logInMiddleware.js'
import validateSession from '../middlewares/sessionMiddleware.js';
const router = express.Router();
//nao consegui fazer o middleware no login de uma forma legal,
//  então deixei no controller, mas ainda vou mexer dps pra ver se consigo.

router.post('/signup', userAlreadyExist, authController.createParticipant)
router.post('/signin', /* logInValidate, */ authController.logInParticipant)
router.delete('/logOut',validateSession, authController.logOutParticipant )

// tem q ser export default
export default router;
