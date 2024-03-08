import UserController from "../../controllers/users.controller";
import UserRepository from "../../repositories/users.repository";

import db from '../../db/knex';
import AccountRepository from "../../repositories/account.repository";
import { validateUser } from "../../validators/create-user.validator";
import { object } from "joi";

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

        const body = {
            email: "ab@email.com",
            first_name: "12",
            last_name: "13",
            phone_number: "13445678",
            pin: "1234"
        }   

        const req = {
            body: body
        }

        it("should create a user", async () => {
            jest.spyOn(usersRepository, "getUserByEmailOrPhoneNumber").mockResolvedValueOnce(undefined);
        
            const mockUser = { id: 1, ...body, accountNumber: 1};
            jest.spyOn(db, "transaction").mockResolvedValueOnce(mockUser);

            await userController.create(req as any, res as any);

            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining(mockUser));
        });

        it("should return an error if the user already exists", async () => {
            
            const mockUser = { id: 1, accountNumber: 1};

            jest.spyOn(usersRepository, "getUserByEmailOrPhoneNumber").mockResolvedValueOnce(mockUser);

            await userController.create(req as any, res as any);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
                details: expect.any(String),
                success: expect.any(Boolean)
             }));
        });

        it("should return an error if the user input is invalid", async () => {
            const body = {
                email: "a", // invalid email
                first_name: "1",
                last_name: "13",
                phone_number: "13445678",
                pin: "1234"
            }   
    
            const req = {
                body: body
            }

            await userController.create(req as any, res as any);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));
        })
    });
});