import express from 'express';

import UserController  from '../controllers/users.controller';
import IsAuthenticated from '../middlewares/auth.middleware';
import UserRepository from '../repositories/users.repository';
import AccountRepository from '../repositories/account.repository';

const Router = express.Router();

const userRepository = new UserRepository();
const accountRepository = new AccountRepository();
const userController = new UserController(userRepository, accountRepository);

Router.get("/me", IsAuthenticated, userController.getUser);
Router.post("/", userController.create);

export default Router;