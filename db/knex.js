"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("../knexfile"));
// initialize the environment variables
(0, dotenv_1.config)();
const { NODE_ENV } = process.env;
const environment = NODE_ENV || "development";
const db = (0, knex_1.default)(knexfile_1.default[environment]);
exports.default = db;
