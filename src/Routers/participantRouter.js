import express from 'express';
import * as authController from '.././controllers/authController.js'

const router = express.Router();

router.post('/signup', authController.createParticipant)
router.post('/signin', authController.logInParticipant)

// tem q ser export default
export default router;
