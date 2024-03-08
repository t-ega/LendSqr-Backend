"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateWithdrawal = exports.Schema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.Schema = joi_1.default.object({
    source: joi_1.default.number().required(),
    amount: joi_1.default.number().required(),
    destination: joi_1.default.number().required(),
    transaction_pin: joi_1.default.string().required().messages({ "any.only": "You must have a pin" }).min(4),
    destinationBankName: joi_1.default.string().required(),
});
const validateWithdrawal = (withdrawal) => {
    return exports.Schema.validate(withdrawal);
};
exports.validateWithdrawal = validateWithdrawal;
