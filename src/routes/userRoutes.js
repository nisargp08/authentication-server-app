import { Router } from 'express';
import upload from '../config/multer';

import { protect } from '../controllers/authController';
import * as userController from '../controllers/usersController';

const router = Router();

// Individual user routes
router.patch('/updateProfile', protect, upload.single('profilePhoto'), userController.updateProfile);
router.patch('/updatePassword', protect, userController.updatePassword);
router.delete('/deleteAccount', protect, userController.deleteAccount);

// User routes
router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUserById);

export default router;
