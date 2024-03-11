// routes/accounts.routes.js

// This file defines the routes for handling account-related operations such as deposit, transfer, and withdrawal.

import express from 'express';

import IsAuthenticated from '../middlewares/auth.middleware';
import idempotencyMiddleWare from '../middlewares/idepotency.middleware';
import AccountController from '../controllers/account.controller';
import AccountRepository from '../repositories/account.repository';
import customCache from '../utils/cutom-cache';

const Router = express.Router();

const accountsRepository = new AccountRepository();
const accountsController = new AccountController(accountsRepository, customCache);

Router.post("/deposit", [IsAuthenticated, idempotencyMiddleWare], accountsController.deposit);
Router.post("/transfer", [IsAuthenticated, idempotencyMiddleWare], accountsController.transfer);
Router.post("/withdraw", [IsAuthenticated, idempotencyMiddleWare], accountsController.withdraw);

export default Router;