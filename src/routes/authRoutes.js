import Router from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.patch('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

export default router;
