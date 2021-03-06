import Router from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/signup', authController.signup);
router.patch('/forgotPassword', authController.forgotPassword);
router.get('/checkResetToken/:token', authController.checkResetToken);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/byToken', authController.protect, authController.getUserByToken);

export default router;
