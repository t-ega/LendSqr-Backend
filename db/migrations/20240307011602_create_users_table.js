"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
const types_1 = require("../../types");
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.createTable('users', function (table) {
            table.increments("id");
            table.string("first_name", 255).notNullable();
            table.string("last_name", 255).notNullable();
            table.string("email", 100).notNullable();
            table.string("password", 255).notNullable();
            table.string("phone_number", 20).notNullable();
            table.boolean("is_active").defaultTo(true).notNullable();
            table.enu("role", Object.values(types_1.UserRoles)).notNullable().defaultTo(types_1.UserRoles.REGULAR);
            table.timestamp("last_login").defaultTo(knex.fn.now());
            table.timestamps(true);
        });
    });
}
exports.up = up;
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.dropTable("users");
    });
}
exports.down = down;
