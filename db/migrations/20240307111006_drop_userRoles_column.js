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
        return knex.schema.alterTable("users", function (table) {
            table.dropColumn("role");
            table.dropColumn("last_login");
        });
    });
}
exports.up = up;
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        return knex.schema.alterTable("users", function (table) {
            table.enu("role", Object.values(types_1.UserRoles)).notNullable().defaultTo("user");
            table.timestamp("last_login").defaultTo(knex.fn.now());
        });
    });
}
exports.down = down;
