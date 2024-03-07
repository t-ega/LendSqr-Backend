import express from 'express';

import IsAuthenticated from '../middlewares/auth.middleware';
import AccountController from '../controllers/account.controller';

const Router = express.Router();


Router.post("/deposit", IsAuthenticated, AccountController.deposit);
Router.post("/transfer", IsAuthenticated, AccountController.transfer);
Router.post("/withdraw", IsAuthenticated, AccountController.withdrawFunds);

export default Router;