import { Request, Response } from "express";

import db from "../db/knex";
import { DepositFundsDto } from "../dto/deposit.dto";
import { CreateTransferDto } from "../dto/transfer.dto";
import { WithdrawalDto } from "../dto/withdrawal.dto";
import { UpdateAccountDto } from "../dto/update-account.dto";
import ErrorFactory from "../errorFactory.factory";
import AccountRepository from "../repositories/account.repository";
import { validateTransfer } from "../validators/transfer.validator";

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
    deposit = async (req: Request, res: Response): Promise<Response> => {
        const userId = req.userId as number;
        const { amount } = req.body as DepositFundsDto;

        // Find the account to deposit into
        const account = await this.accountsRepository.findByOwnerId(userId);
        if (!account) return res.status(404).json(ErrorFactory.getError("Bank account doesn't exist"));

        const updatedBalance = account.balance + amount;
        
        const updateDto = {
            balance: updatedBalance,
            owner: userId
        } as UpdateAccountDto;
        
        try {
            // Perform the deposit
            await db.transaction(async (trx) => {
                
                const depositResult = await this.accountsRepository.update(trx, updateDto);

                // Returns the number of affected rows, the deposit should affect only one row
                if(depositResult != 1) {
                    throw new Error("Deposit failed");                
                }
            })
        }
        catch(error) {
            return this.handleTransactionError(res, error);
        }

        return res.json({ success: true, details: { ...updateDto } });
    }

    /**
     * Transfers funds from one account to another
     * @param req The request object
     * @param res The response object
     * @returns JSON response indicating success or failure of the transfer
     */
    transfer = async (req: Request, res: Response): Promise<Response> => {
        const req_user_id = req.userId;

        const { error }  = validateTransfer(req.body);

        if (error) {
            return res.status(400).json(ErrorFactory.getError(error.details[0].message))
        }

        const { source, amount, transaction_pin: pin, destination } = req.body as CreateTransferDto;

        const senderAccount = await this.accountsRepository.find(source);
        const recipientAccount = await this.accountsRepository.find(destination);

        // Check for various transfer conditions
        if (amount <= 0) {
            return res.status(400).json(ErrorFactory.getError("Invalid amount"));
        }
        
        if (!senderAccount || !recipientAccount) {
            return res.status(400).json(ErrorFactory.getError("One or both bank accounts do not exist."));
        }
        
        if (senderAccount.owner != req_user_id) {
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

        // Ensure atomicity of the transfer
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

                const senderUpdateResult = await this.accountsRepository.update(trx, senderUpdateDto);
                const recipientUpdateResult = await this.accountsRepository.update(trx, recipientUpdateDto);

                if (senderUpdateResult !== 1 || recipientUpdateResult !== 1) {
                    throw new Error("Deposit failed");                
                }

            })
            
            return res.json({ success: true, destination, source, amount });

        }
        catch(error) {
            return this.handleTransactionError(res, error);
        }
    }

    /**
     * Withdraws funds from an account
     * @param req The request object
     * @param res The response object
     * @returns JSON response indicating success or failure of the withdrawal
     */
    withdraw = async (req: Request, res: Response): Promise<Response> => {
        const { source, amount, transaction_pin: pin,  destination, destinationBankName } = req.body as WithdrawalDto;
     
        // Fetch the source account
        const sourceAccount = await this.accountsRepository.find(source);
     
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

                const withdrawalResult = await this.accountsRepository.update(trx, updateDto);

                // Returns the number of affected rows, the withdrawal should affect only one row
                if(withdrawalResult !== 1){
                    throw new Error("Withdrawal failed");
                }

            });

            return res.json({ success: true, destination, source, amount, destinationBankName });
        }
        catch(error) {
            return this.handleTransactionError(res, error);
        }

    }
}

export default AccountsController;
