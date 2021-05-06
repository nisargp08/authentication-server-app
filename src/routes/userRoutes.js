import { Router } from 'express';
import * as userController from '../controllers/usersController';

const router = Router();
// Individual user routes
router.patch('/updatePassword', userController.updatePassword);

// User routes
router.route('/').get(userController.getAllUsers);

router.route('/:id').get(userController.getUserById);

export default router;
