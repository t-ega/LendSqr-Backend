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
const account_controller_1 = __importDefault(require("../../controllers/account.controller"));
const account_repository_1 = __importDefault(require("../../repositories/account.repository"));
const knex_1 = __importDefault(require("../../db/knex"));
// Mocking the knex dependency
jest.mock('../../db/knex', () => require('../__mocks__/knex.mock'));
describe('AccountsController', () => {
    let accountsController;
    let accountsRepository;
    beforeEach(() => {
        accountsRepository = new account_repository_1.default();
        accountsController = new account_controller_1.default(accountsRepository);
    });
    it("acccounts repository should be defined", () => {
        expect(accountsRepository).toBeDefined();
    });
    it("accounts controller should be defined", () => {
        expect(accountsController).toBeDefined();
    });
    describe('deposit', () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockOwner = {
            balance: 100,
            account_number: 1,
            owner: 1,
            transaction_pin: "1234"
        };
        const req = {
            userId: 1,
            body: {
                amount: 100
            }
        };
        it("should deposit funds successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const findByOwnerId = jest.spyOn(accountsRepository, 'findByOwnerId').mockResolvedValueOnce(mockOwner);
            jest.spyOn(knex_1.default, 'transaction').mockResolvedValue(null);
            yield accountsController.deposit(req, res);
            expect(findByOwnerId).toHaveBeenCalledWith(1);
            expect(knex_1.default.transaction).toHaveBeenCalled(); // if a transaction is called, it means the deposit was successful
            expect(res.json).toHaveBeenCalledWith({ success: true, details: { balance: 200, owner: 1 } });
        }));
        it("should return an error if the account doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const findByOwnerId = jest.spyOn(accountsRepository, 'findByOwnerId').mockResolvedValueOnce(undefined);
            yield accountsController.deposit(req, res);
            expect(findByOwnerId).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
        it("should return an error if the deposit fails", () => __awaiter(void 0, void 0, void 0, function* () {
            const findByOwnerId = jest.spyOn(accountsRepository, 'findByOwnerId').mockResolvedValueOnce(mockOwner);
            jest.spyOn(knex_1.default, 'transaction').mockRejectedValue(new Error('Transaction error'));
            yield accountsController.deposit(req, res);
            expect(findByOwnerId).toHaveBeenCalledWith(1);
            expect(knex_1.default.transaction).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
        it("should return an error if amount is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                userId: 1,
                body: {
                    amount: -100
                }
            };
            yield accountsController.deposit(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
    });
    describe('transfer', () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const body = {
            amount: 100,
            destination: 2,
            source: 1,
            transaction_pin: "1234"
        };
        const req = {
            userId: 1,
            body
        };
        it("should transfer funds successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const compare = jest.spyOn(bcrypt_1.default, 'compare').mockImplementationOnce((x, y) => Promise.resolve(true));
            jest.spyOn(knex_1.default, 'transaction').mockResolvedValue(null);
            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce({ balance: 100, account_number: 2, owner: 1, transaction_pin: "1234" });
            const findRecipient = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce({ balance: 50, account_number: 3, owner: 2, transaction_pin: "5678" });
            yield accountsController.transfer(req, res);
            expect(knex_1.default.transaction).toHaveBeenCalled();
            expect(find).toHaveBeenCalledTimes(2); // for both the sender and the recipient
            expect(find).toHaveBeenCalledWith(body.source);
            expect(findRecipient).toHaveBeenCalledWith(body.destination);
            expect(compare).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, destination: 2, source: 1, amount: 100 });
        }));
        it("should return an error if the amount is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                userId: 1,
                body: {
                    amount: -100
                }
            };
            yield accountsController.transfer(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
        it("should return an error if the sender account doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValue(undefined);
            jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce({ balance: 50, account_number: 3, owner: 2, transaction_pin: "5678" });
            yield accountsController.transfer(req, res);
            expect(find).toHaveBeenCalledWith(body.source);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
        it("should return an error if the recipient account doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce({ balance: 100, account_number: 2, owner: 1, transaction_pin: "1234" });
            const findRecipient = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce(undefined);
            yield accountsController.transfer(req, res);
            expect(find).toHaveBeenCalledWith(body.source);
            expect(findRecipient).toHaveBeenCalledWith(body.destination);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
        it("should return an error if the sender and recipient are the same", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                userId: 1,
                body: {
                    amount: 100,
                    destination: 1,
                    source: 1,
                    transaction_pin: "1234"
                }
            };
            yield accountsController.transfer(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
    });
    describe('withdraw', () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const body = {
            amount: 100,
            transaction_pin: "1234",
            source: 1,
            destination: 3, // external bank account
            destinationBankName: "GTB"
        };
        const req = {
            userId: 1,
            body
        };
        it("should withdraw funds successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockOwner = {
                balance: 100,
                account_number: 1,
                owner: 1,
                transaction_pin: "1234"
            };
            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce(mockOwner);
            jest.spyOn(bcrypt_1.default, "compare").mockImplementationOnce(() => Promise.resolve(true));
            jest.spyOn(knex_1.default, 'transaction').mockResolvedValue(null);
            yield accountsController.withdraw(req, res);
            expect(find).toHaveBeenCalledWith(1);
            expect(knex_1.default.transaction).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, destination: 3, destinationBankName: "GTB", source: 1, amount: 100 }));
        }));
        it("should return an error if the account doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce(undefined);
            yield accountsController.withdraw(req, res);
            expect(find).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
    });
});
