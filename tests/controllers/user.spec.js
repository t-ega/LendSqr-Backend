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
const users_controller_1 = __importDefault(require("../../controllers/users.controller"));
const users_repository_1 = __importDefault(require("../../repositories/users.repository"));
const knex_1 = __importDefault(require("../../db/knex"));
const account_repository_1 = __importDefault(require("../../repositories/account.repository"));
jest.mock('../../db/knex', () => require('../__mocks__/knex.mock'));
describe("UserControllers", () => {
    let userController;
    let accountsRepository;
    let usersRepository;
    beforeEach(() => {
        usersRepository = new users_repository_1.default();
        accountsRepository = new account_repository_1.default();
        userController = new users_controller_1.default(usersRepository, accountsRepository);
    });
    describe("create", () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const body = {
            email: "ab@email.com",
            first_name: "12",
            last_name: "13",
            phone_number: "13445678",
            pin: "1234"
        };
        const req = {
            body: body
        };
        it("should create a user", () => __awaiter(void 0, void 0, void 0, function* () {
            jest.spyOn(usersRepository, "getUserByEmailOrPhoneNumber").mockResolvedValueOnce(undefined);
            const mockUser = Object.assign(Object.assign({ id: 1 }, body), { accountNumber: 1 });
            jest.spyOn(knex_1.default, "transaction").mockResolvedValueOnce(mockUser);
            yield userController.create(req, res);
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining(mockUser));
        }));
        it("should return an error if the user already exists", () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = { id: 1, accountNumber: 1 };
            jest.spyOn(usersRepository, "getUserByEmailOrPhoneNumber").mockResolvedValueOnce(mockUser);
            yield userController.create(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
        it("should return an error if the user input is invalid", () => __awaiter(void 0, void 0, void 0, function* () {
            const body = {
                email: "a", // invalid email
                first_name: "1",
                last_name: "13",
                phone_number: "13445678",
                pin: "1234"
            };
            const req = {
                body: body
            };
            yield userController.create(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        }));
    });
});
