import { Router } from 'express';
import upload from '../config/multer';

import * as userController from '../controllers/usersController';

const router = Router();

// Individual user routes
router.patch('/updateProfile', upload.single('profilePhoto'), userController.updateProfile);
router.patch('/updatePassword', userController.updatePassword);
router.delete('/deleteAccount', userController.deleteAccount);

// User routes
router.route('/').get(userController.getAllUsers);
router.route('/:id').get(userController.getUserById);

export default router;
