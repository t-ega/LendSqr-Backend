import bcyrpt from 'bcrypt';
import AccountsController from "../../controllers/account.controller";
import AccountRepository from "../../repositories/account.repository";


import db from '../../db/knex';
import { CreateTransferDto } from '../../dto/transfer.dto';
import { WithdrawalDto } from '../../dto/withdrawal.dto';

// Mocking the knex dependency
jest.mock('../../db/knex', () => require('../__mocks__/knex.mock'));

describe('AccountsController', () => {
    let accountsController: AccountsController;
    let accountsRepository: AccountRepository;
    
    beforeEach(() => {
        accountsRepository = new AccountRepository();
        accountsController = new AccountsController(accountsRepository);
    });

    it("acccounts repository should be defined", () => {
        expect(accountsRepository).toBeDefined()
    });

    it("accounts controller should be defined", () => {
        expect(accountsController).toBeDefined()
    });

    describe('deposit', () => { 
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockOwner = {
            balance: 100,
            account_number: 1,
            owner: 1,
            transaction_pin: "1234"
        }

        const req = {
            userId: 1,
            body: {
                amount: 100
            }
        }
        it("should deposit funds successfully", async () => {
    
            const findByOwnerId = jest.spyOn(accountsRepository, 'findByOwnerId').mockResolvedValueOnce(mockOwner);
    
            jest.spyOn(db, 'transaction').mockResolvedValue(null);
    
            await accountsController.deposit(req as any, res as any);
    
            expect(findByOwnerId).toHaveBeenCalledWith(1);
            expect(db.transaction).toHaveBeenCalled(); // if a transaction is called, it means the deposit was successful
            expect(res.json).toHaveBeenCalledWith({ success: true, details: { balance: 200, owner: 1 } });
        });
    
        it("should return an error if the account doesn't exist", async () => {    
            const findByOwnerId = jest.spyOn(accountsRepository, 'findByOwnerId').mockResolvedValueOnce(undefined);
    
            await accountsController.deposit(req as any, res as any);
    
            expect(findByOwnerId).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            })); 
        });
    
        it("should return an error if the deposit fails", async () => {
            const findByOwnerId = jest.spyOn(accountsRepository, 'findByOwnerId').mockResolvedValueOnce(mockOwner);
    
            jest.spyOn(db, 'transaction').mockRejectedValue(new Error('Transaction error'));
    
            await accountsController.deposit(req as any, res as any);
    
            expect(findByOwnerId).toHaveBeenCalledWith(1);
            expect(db.transaction).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));    
        });
    
        it("should return an error if amount is invalid", async () => {
            const req = {
                userId: 1,
                body: {
                    amount: -100
                }
            }
            await accountsController.deposit(req as any, res as any);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));        
        });
    });

    describe('transfer', () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        const body = {
            amount: 100,
            destination: 2,
            source: 1,
            transaction_pin: "1234"
        } as CreateTransferDto;

        const req = {
            userId: 1,
            body
        }

        it("should transfer funds successfully", async () => {
            const compare = jest.spyOn(bcyrpt, 'compare').mockImplementationOnce((x, y) => Promise.resolve(true));
            jest.spyOn(db, 'transaction').mockResolvedValue(null);

            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce({ balance: 100, account_number: 2, owner: 1, transaction_pin: "1234" });
            const findRecipient = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce({ balance: 50, account_number: 3, owner: 2, transaction_pin: "5678" });
           
            await accountsController.transfer(req as any, res as any);
    
            expect(db.transaction).toHaveBeenCalled();
            expect(find).toHaveBeenCalledTimes(2); // for both the sender and the recipient

            expect(find).toHaveBeenCalledWith(body.source);
            expect(findRecipient).toHaveBeenCalledWith(body.destination);
            expect(compare).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ success: true, destination: 2, source: 1, amount: 100 });
        });

        it("should return an error if the amount is invalid", async () => {
            const req = {
                userId: 1,
                body: {
                    amount: -100
                }
            }
            await accountsController.transfer(req as any, res as any);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));        
        });

        it("should return an error if the sender account doesn't exist", async () => {

            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValue(undefined);
            jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce({ balance: 50, account_number: 3, owner: 2, transaction_pin: "5678" });
           
            await accountsController.transfer(req as any, res as any);
    
            expect(find).toHaveBeenCalledWith(body.source);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));        
        });

        it("should return an error if the recipient account doesn't exist", async () => {
            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce({ balance: 100, account_number: 2, owner: 1, transaction_pin: "1234" });
            const findRecipient = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce(undefined);
            await accountsController.transfer(req as any, res as any);
    
            expect(find).toHaveBeenCalledWith(body.source);
            expect(findRecipient).toHaveBeenCalledWith(body.destination);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));        
        });

        it("should return an error if the sender and recipient are the same", async () => {
            const req = {
                userId: 1,
                body: {
                    amount: 100,
                    destination: 1,
                    source: 1,
                    transaction_pin: "1234"
                }
            }
            await accountsController.transfer(req as any, res as any);
    
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            }));            
        });
    });

    describe('withdraw', () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
        const body : WithdrawalDto = {
            amount: 100,
            transaction_pin: "1234",
            source: 1,
            destination: 3, // external bank account
            destinationBankName: "GTB"
        } 

        const req = {
            userId: 1,
            body
        }

        it("should withdraw funds successfully", async () => {
            const mockOwner = {
                balance: 100,
                account_number: 1,
                owner: 1,
                transaction_pin: "1234"
            }
    
            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce(mockOwner);
            
            jest.spyOn(bcyrpt, "compare").mockImplementationOnce(() => Promise.resolve(true));
            jest.spyOn(db, 'transaction').mockResolvedValue(null);
    
            await accountsController.withdraw(req as any, res as any);
    
            expect(find).toHaveBeenCalledWith(1);
            expect(db.transaction).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining(
                { success: true, destination: 3, destinationBankName:"GTB", source: 1, amount: 100 }
            ));
        });

        it("should return an error if the account doesn't exist", async () => {

            const find = jest.spyOn(accountsRepository, 'find').mockResolvedValueOnce(undefined);
    
            await accountsController.withdraw(req as any, res as any);
    
            expect(find).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                details: expect.any(String),
                success: expect.any(Boolean)
            })); 
        })
    });

})