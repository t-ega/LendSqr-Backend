"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controller_1 = __importDefault(require("../controllers/users.controller"));
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const users_repository_1 = __importDefault(require("../repositories/users.repository"));
const account_repository_1 = __importDefault(require("../repositories/account.repository"));
const Router = express_1.default.Router();
const userRepository = new users_repository_1.default();
const accountRepository = new account_repository_1.default();
const userController = new users_controller_1.default(userRepository, accountRepository);
Router.get("/me", auth_middleware_1.default, userController.getUser);
Router.post("/", userController.create);
exports.default = Router;
