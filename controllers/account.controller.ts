import { Request, Response } from "express";
import { DepositFundsDto } from "../dto/deposit.dto";
import db from "../db/knex";
import { CreateTransferDto } from "../dto/transfer.dto";
import { WithdrawalDto } from "../dto/withdrawal.dto";
import { AccountDto } from "../dto/account.dto";
import { Account } from "knex/types/tables";

class AccountsController {

    private generateAccountNumber(): number {
        /**
         * In the internal systems every account number 
         * must start with `21`
         */
         let randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
         // every account number is prefixed with a 21
         const accountNumber =  "21" + randomNumber.toString();
         return parseInt(accountNumber)
    }

    async createAccount(accountDto: AccountDto) : Promise<Account | undefined>{
        const account_number = this.generateAccountNumber();
        await db("accounts").insert({...accountDto, account_number});

        // MySQL doesn't support returning of columns so we have to query again
        const account = await db("accounts").select().where(account_number).first();
        return account;
    }

    /**
     * Retrieves an account by its account number
     * @param accountNumber The account number to retrieve
     * @returns Promise resolving to the account object if found, otherwise null
     */
    private async getAccountByNumber(accountNumber: number) {
        return await db("accounts").select().where({ account_number: accountNumber }).first();
    }

    /**
     * Handles transaction errors and sends an appropriate response
     * @param res The response object
     * @param error The error object
     * @returns JSON response containing error details
     */
    private async handleTransactionError(res: Response, error: any) {
        return res.status(400).json({ success: false, details: error });
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
        const account = await this.getAccountByNumber(account_number);
        if (!account) return res.status(404).json({ success: false, details: "Destination account doesn't exist" });

        const updatedBalance = account.balance + amount;

        try {
            // Perform the deposit
            await db.transaction(async function(trx) {
                await trx("accounts").insert({ balance: updatedBalance }).where({ owner: userId });
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
        const { source, amount, pin, destination } = req.body as CreateTransferDto;

        // Ensure atomicity
        const senderAccount = await this.getAccountByNumber(source);
        const recipientAccount = await this.getAccountByNumber(destination);

        // Check for various transfer conditions
        if (amount <= 0 || !senderAccount || !recipientAccount || senderAccount.owner !== req_user_id ||
            source === destination || senderAccount.balance < amount || senderAccount.pin !== pin) {
            return res.status(400).json({ success: false, details: "Invalid transfer request" });
        }

        try {
            // Perform the transfer
            await db.transaction(async function(trx) {
                const updatedBalance = senderAccount.balance - amount;
                const recipientUpdatedBalance = recipientAccount.balance + amount;

                // Debit the sender then credit the receiver
                trx("accounts").insert({ balance: updatedBalance }).where({ account_number: senderAccount.account_number }).then(async function() {
                    await trx("accounts").insert({ balance: recipientUpdatedBalance }).where({ account_number: recipientAccount.account_number });
                });
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
        const { source, amount, pin,  destination, destinationBankName } = req.body as WithdrawalDto;
     
        // Fetch the source account
        const sourceAccount = await this.getAccountByNumber(source);
     
        // Check if source account exists and has sufficient balance and pin is valid
        if (!sourceAccount || sourceAccount.balance < amount || sourceAccount.pin !== pin) {
            return res.status(400).json({ success: false, details: "Invalid withdrawal request" });
        }

        try {
            // Perform the withdrawal
            await db.transaction(function(trx) {
                const updatedBalance = sourceAccount.balance - amount;
                trx("accounts").insert({ balance: updatedBalance }).where({ account_number: sourceAccount.account_number });
            });
        }
        catch(error) {
            return this.handleTransactionError(res, error);
        }

        return res.json({ success: true, destination, source, amount, destinationBankName });
    }
}

export default new AccountsController();
