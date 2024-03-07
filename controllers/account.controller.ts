import { Request, Response } from "express";

import db from "../db/knex";
import { DepositFundsDto } from "../dto/deposit.dto";
import { CreateTransferDto } from "../dto/transfer.dto";
import { WithdrawalDto } from "../dto/withdrawal.dto";
import { UpdateAccountDto } from "../dto/update-account.dto";
import ErrorFactory from "../errorFactory.factory";
import AccountRepository from "../repositories/account.repository";

class AccountsController {

    constructor(private accountsRepository : AccountRepository) {}
   
    /**
     * Handles transaction errors and sends an appropriate response
     * @param res The response object
     * @param error The error object
     * @returns JSON response containing error details
     */
    private async handleTransactionError(res: Response, error: any) {
        return res.status(400).json(ErrorFactory.getError(error));
    }

    /**
     * Deposits funds into a user's account
     * @param req The request object
     * @param res The response object
     * @returns JSON response indicating success or failure of the deposit
     */
    async deposit(req: Request, res: Response): Promise<Response> {
        const userId = req.userId;
        const { account_number, amount } = req.body as DepositFundsDto;

        // Find the account to deposit into
        const account = await this.accountsRepository.getAccountByNumber(account_number);
        if (!account) return res.status(404).json(ErrorFactory.getError("Destination account doesn't exist"));

        const updatedBalance = account.balance + amount;

        const updateDto = {
            balance: updatedBalance,
            owner: userId
        } as UpdateAccountDto;

        try {
            // Perform the deposit
            await db.transaction(async (trx) => {
                await this.accountsRepository.updateAccount(trx, updateDto);
            })
        }
        catch(error) {
            return this.handleTransactionError(res, error);
        }

        return res.json({ success: true, details: { account } });
    }

    /**
     * Transfers funds from one account to another
     * @param req The request object
     * @param res The response object
     * @returns JSON response indicating success or failure of the transfer
     */
    async transfer(req: Request, res: Response): Promise<Response> {
        const req_user_id = req.userId;
        const { source, amount, transaction_pin: pin, destination } = req.body as CreateTransferDto;

        // Ensure atomicity
        const senderAccount = await this.accountsRepository.getAccountByNumber(source);
        const recipientAccount = await this.accountsRepository.getAccountByNumber(destination);

        // Check for various transfer conditions
        if (amount <= 0) {
            return res.status(400).json(ErrorFactory.getError("Invalid amount"));
        }
        
        if (!senderAccount || !recipientAccount) {
            return res.status(400).json(ErrorFactory.getError("One or both bank accounts do not exist."));
        }
        
        if (senderAccount.owner !== req_user_id) {
            return res.status(400).json(ErrorFactory.getError("You are not allowed to transfer from this account" ));
        }
        
        if (source === destination) {
            return res.status(400).json(ErrorFactory.getError("Sender and recipient account cannot be the same"));
        }
        
        if (senderAccount.balance < amount) {
            return res.status(400).json(ErrorFactory.getError("Insufficient funds in the sender account." ));
        }

        const isValid = (senderAccount.pin === pin);

        if (!isValid) {
             return res.status(400).json(ErrorFactory.getError("Invalid transaction pin"));
        }

        try {
            // Perform the transfer
            await db.transaction(async (trx) => {

                const senderUpdatedBalance = senderAccount.balance - amount;
                const recipientUpdatedBalance = recipientAccount.balance + amount;

                const senderUpdateDto = {
                    balance: senderUpdatedBalance,
                    owner: senderAccount.owner
                } as UpdateAccountDto;

                const recipientUpdateDto = {
                    balance: recipientUpdatedBalance,
                    owner: recipientAccount.owner
                } as UpdateAccountDto;

                // Debit the sender then credit the receiver
                this.accountsRepository.updateAccount(trx, senderUpdateDto);
                this.accountsRepository.updateAccount(trx, recipientUpdateDto);
            })
        }
        catch(error) {
            return this.handleTransactionError(res, error);
        }

        return res.json({ success: true, destination, source, amount });
    }

    /**
     * Withdraws funds from an account
     * @param req The request object
     * @param res The response object
     * @returns JSON response indicating success or failure of the withdrawal
     */
    async withdraw(req: Request, res: Response): Promise<Response> {
        const { source, amount, transaction_pin: pin,  destination, destinationBankName } = req.body as WithdrawalDto;
     
        // Fetch the source account
        const sourceAccount = await this.accountsRepository.getAccountByNumber(source);
     
        // Check if source account exists and has sufficient balance and pin is valid
        if (!sourceAccount || sourceAccount.balance < amount || sourceAccount.pin !== pin) {
            return res.status(400).json(ErrorFactory.getError("Invalid withdrawal request"));
        }

        try {
            // Perform the withdrawal
            await db.transaction(async (trx) => {
                const updatedBalance = sourceAccount.balance - amount;
               
                const updateDto = {
                    balance: updatedBalance,
                    owner: sourceAccount.owner
                } as UpdateAccountDto;

                await this.accountsRepository.updateAccount(trx, updateDto);
            });
        }
        catch(error) {
            return this.handleTransactionError(res, error);
        }

        return res.json({ success: true, destination, source, amount, destinationBankName });
    }
}

export default AccountsController;
