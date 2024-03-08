"use strict";
// routes/accounts.routes.js
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This file defines the routes for handling account-related operations such as deposit, transfer, and withdrawal.
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const account_controller_1 = __importDefault(require("../controllers/account.controller"));
const account_repository_1 = __importDefault(require("../repositories/account.repository"));
const Router = express_1.default.Router();
const accountsRepository = new account_repository_1.default();
const accountsController = new account_controller_1.default(accountsRepository);
Router.post("/deposit", auth_middleware_1.default, accountsController.deposit);
Router.post("/transfer", auth_middleware_1.default, accountsController.transfer);
Router.post("/withdraw", auth_middleware_1.default, accountsController.withdraw);
exports.default = Router;
