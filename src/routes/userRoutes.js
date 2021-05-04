import { Router } from 'express';
import * as userController from '../controllers/usersController';
import * as authController from '../controllers/authController';

const router = Router();

// Auth routes
router.post('/signup', authController.signup);
// User routes
router
  .route('/')
  .get(userController.getAllUsers);

router.route('/:id').get(userController.getUserById);

export default router;
