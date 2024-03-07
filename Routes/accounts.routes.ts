// routes/accounts.routes.js

// This file defines the routes for handling account-related operations such as deposit, transfer, and withdrawal.

import express from 'express';

import IsAuthenticated from '../middlewares/auth.middleware';
import AccountController from '../controllers/account.controller';

const Router = express.Router();


Router.post("/deposit", IsAuthenticated, AccountController.deposit);
Router.post("/transfer", IsAuthenticated, AccountController.transfer);
Router.post("/withdraw", IsAuthenticated, AccountController.withdraw);

export default Router;