// routes/accounts.routes.js

// This file defines the routes for handling account-related operations such as deposit, transfer, and withdrawal.

import express from 'express';

import IsAuthenticated from '../middlewares/auth.middleware';
import AccountController from '../controllers/account.controller';
import AccountRepository from '../repositories/account.repository';

const Router = express.Router();

const accountsRepository = new AccountRepository();
const accountsController = new AccountController(accountsRepository)

Router.post("/deposit", IsAuthenticated, accountsController.deposit);
Router.post("/transfer", IsAuthenticated, accountsController.transfer);
Router.post("/withdraw", IsAuthenticated, accountsController.withdraw);

export default Router;