import { Router } from 'express';
import * as userController from '../controllers/usersController';

const router = Router();

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id').get(userController.getUserById);

export default router;
