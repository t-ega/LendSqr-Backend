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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const knex_1 = __importDefault(require("../db/knex"));
const errorFactory_factory_1 = __importDefault(require("../errorFactory.factory"));
const transfer_validator_1 = require("../validators/transfer.validator");
const withdraw_validator_1 = require("../validators/withdraw.validator");
class AccountsController {
    constructor(accountsRepository) {
        this.accountsRepository = accountsRepository;
        /**
         * Deposits funds into a user's account
         * @param req The request object
         * @param res The response object
         * @returns JSON response indicating success or failure of the deposit
         */
        this.deposit = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const userId = req.userId;
            const { amount } = req.body;
            if (amount <= 0)
                return res.status(400).json(errorFactory_factory_1.default.getError("Invalid amount"));
            // Find the account to deposit into
            const account = yield this.accountsRepository.findByOwnerId(userId);
            if (!account)
                return res.status(404).json(errorFactory_factory_1.default.getError("Bank account doesn't exist"));
            const updatedBalance = account.balance + amount;
            const updateDto = {
                balance: updatedBalance,
                owner: userId
            };
            try {
                // Perform the deposit
                yield knex_1.default.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const depositResult = yield this.accountsRepository.update(trx, updateDto);
                    // Returns the number of affected rows, the deposit should affect only one row
                    if (depositResult != 1) {
                        throw new Error("Deposit failed");
                    }
                }));
            }
            catch (error) {
                return this.handleTransactionError(res, error);
            }
            return res.json({ success: true, details: Object.assign({}, updateDto) });
        });
        /**
         * Transfers funds from one account to another
         * @param req The request object
         * @param res The response object
         * @returns JSON response indicating success or failure of the transfer
         */
        this.transfer = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const req_user_id = req.userId;
            const { error, value } = (0, transfer_validator_1.validateTransfer)(req.body);
            if (error) {
                return res.status(400).json(errorFactory_factory_1.default.getError(error.details[0].message));
            }
            const { source, amount, transaction_pin, destination } = value;
            if (source === destination) {
                return res.status(400).json(errorFactory_factory_1.default.getError("Sender and recipient account cannot be the same"));
            }
            const senderAccount = yield this.accountsRepository.find(source);
            const recipientAccount = yield this.accountsRepository.find(destination);
            // Check for various transfer conditions
            if (amount <= 0) {
                return res.status(400).json(errorFactory_factory_1.default.getError("Invalid amount"));
            }
            if (!senderAccount || !recipientAccount) {
                return res.status(404).json(errorFactory_factory_1.default.getError("One or both bank accounts do not exist."));
            }
            if (senderAccount.owner != req_user_id) {
                return res.status(400).json(errorFactory_factory_1.default.getError("You are not allowed to transfer from this account"));
            }
            if (senderAccount.balance < amount) {
                return res.status(400).json(errorFactory_factory_1.default.getError("Insufficient funds in the sender account."));
            }
            const isValid = yield bcrypt_1.default.compare(transaction_pin, senderAccount.transaction_pin);
            if (!isValid) {
                return res.status(400).json(errorFactory_factory_1.default.getError("Invalid transaction pin"));
            }
            // Ensure atomicity of the transfer
            try {
                // Perform the transfer
                yield knex_1.default.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const senderUpdatedBalance = senderAccount.balance - amount;
                    const recipientUpdatedBalance = recipientAccount.balance + amount;
                    const senderUpdateDto = {
                        balance: senderUpdatedBalance,
                        owner: senderAccount.owner
                    };
                    const recipientUpdateDto = {
                        balance: recipientUpdatedBalance,
                        owner: recipientAccount.owner
                    };
                    const senderUpdateResult = yield this.accountsRepository.update(trx, senderUpdateDto);
                    const recipientUpdateResult = yield this.accountsRepository.update(trx, recipientUpdateDto);
                    if (senderUpdateResult !== 1 || recipientUpdateResult !== 1) {
                        throw new Error("Deposit failed");
                    }
                }));
                return res.json({ success: true, destination, source, amount });
            }
            catch (error) {
                return this.handleTransactionError(res, error);
            }
        });
        /**
         * Withdraws funds from an account
         * @param req The request object
         * @param res The response object
         * @returns JSON response indicating success or failure of the withdrawal
         */
        this.withdraw = (req, res) => __awaiter(this, void 0, void 0, function* () {
            // validate data
            const { error, value } = (0, withdraw_validator_1.validateWithdrawal)(req.body);
            if (error) {
                return res.status(400).json(errorFactory_factory_1.default.getError(error.details[0].message));
            }
            const { source, amount, transaction_pin: pin, destination, destinationBankName } = value;
            // Fetch the source account
            const sourceAccount = yield this.accountsRepository.find(source);
            // Check if source account exists and has sufficient balance and pin is valid
            if (!sourceAccount) {
                return res.status(404).json(errorFactory_factory_1.default.getError("Source Bank account do not exist."));
            }
            if (sourceAccount.balance < amount) {
                return res.status(400).json(errorFactory_factory_1.default.getError("Insufficient funds in the sender account."));
            }
            const isValid = yield bcrypt_1.default.compare(pin, sourceAccount.transaction_pin);
            if (!isValid) {
                return res.status(400).json(errorFactory_factory_1.default.getError("Invalid transaction pin"));
            }
            try {
                // Perform the withdrawal
                yield knex_1.default.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                    const updatedBalance = sourceAccount.balance - amount;
                    const updateDto = {
                        balance: updatedBalance,
                        owner: sourceAccount.owner
                    };
                    const withdrawalResult = yield this.accountsRepository.update(trx, updateDto);
                    // Returns the number of affected rows, the withdrawal should affect only one row
                    if (withdrawalResult !== 1) {
                        throw new Error("Withdrawal failed");
                    }
                }));
                return res.json({ success: true, destination, source, amount, destinationBankName });
            }
            catch (error) {
                return this.handleTransactionError(res, error);
            }
        });
    }
    /**
     * Handles transaction errors and sends an appropriate response
     * @param res The response object
     * @param error The error object
     * @returns JSON response containing error details
     */
    handleTransactionError(res, error) {
        return __awaiter(this, void 0, void 0, function* () {
            return res.status(400).json(errorFactory_factory_1.default.getError(error));
        });
    }
}
exports.default = AccountsController;
