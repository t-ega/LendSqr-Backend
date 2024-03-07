import UserController from "../../controllers/users.controller";
import UserRepository from "../../repositories/users.repository";

import db from '../../db/knex';
import AccountRepository from "../../repositories/account.repository";

jest.mock('../../db/knex', () => require('../__mocks__/knex.mock'));

describe("UserControllers", () => {
    let userController: UserController;
    let accountsRepository: AccountRepository;
    let usersRepository: UserRepository;

    beforeEach(() => {
        usersRepository = new UserRepository();
        accountsRepository = new AccountRepository();
        userController = new UserController(usersRepository, accountsRepository);
    });

    describe("create", () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        it("should create a user", async () => {
            
        });
    });
});