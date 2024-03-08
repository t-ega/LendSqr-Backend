"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountRouter = exports.UserRouter = void 0;
const users_routes_1 = __importDefault(require("./users.routes"));
exports.UserRouter = users_routes_1.default;
const accounts_routes_1 = __importDefault(require("./accounts.routes"));
exports.AccountRouter = accounts_routes_1.default;
