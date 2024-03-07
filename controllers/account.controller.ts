import { Request, Response } from "express";
import { DepositFundsDto } from "../dto/deposit.dto";
import db from "../db/knex";
import { CreateTransferDto } from "../dto/transfer.dto";


class AccountsController {


    async deposit(req: Request, res: Response): Promise<Response> {
       
        const userId = req.userId;

        const {account_number, amount} = req.body as DepositFundsDto;

        // find account to deposit into
        const account = await db("accounts").select("balance", "owner").where({ owner : userId, account_number }).first();
        if (!account) return res.status(404).json({success: false, details: "Destination account doesnt exist"});

        const updatedBalance = account.balance + amount;

        // perform the deposit
        await db.transaction(async function(trx) {
            await trx("accounts").insert({balance: updatedBalance}).where({ owner: userId });
        })

        return res.json({success: true , details: { account }});

    }

    async transfer(req: Request, res: Response): Promise<Response> {
        const req_user_id = req.userId;
        
        const {source, amount, pin, destination} = req.body as CreateTransferDto;
        // enusuring atomicity

        const senderAccount = await db("accounts").select().where({ account_number: source }).first();
        const recipientAccount = await db("accounts").select().where({ account_number: destination }).first();

        if (amount <= 0) {
            return res.status(400).json({ success: false, details: "Invalid amount" });
        }
        
        if (!senderAccount || !recipientAccount) {
            return res.status(400).json({ success: false, details: "One or both bank accounts do not exist." });
        }
        
        if (senderAccount.owner !== req_user_id) {
            return res.status(400).json({ success: false, details: "You are not allowed to transfer from this account" });
        }
        
        if (source === destination) {
            return res.status(400).json({ success: false, details: "Sender and recipient account cannot be the same" });
        }
        
        if (senderAccount.balance < amount) {
            return res.status(400).json({ success: false, details: "Insufficient funds in the sender account." });
        }

        const isValid = (senderAccount.pin === pin);

        if (!isValid) {
             return res.status(400).json({ success: false, details: "Invalid transaction pin" });
        }

        // Perform the transfer
        try {

            await db.transaction(async function(trx) {
                const updatedBalance = senderAccount.balance - amount;
                const recipientUpdatedBalance = recipientAccount.balance + amount;
        
                // debit the sender then credit the reciever
                trx("accounts").insert({balance: updatedBalance}).where({ account_number: senderAccount.account_number}).then(async function(){
                    await trx("accounts").insert({balance: recipientUpdatedBalance}).where({ account_number: recipientAccount.account_number})
                })
                
            })
        }
        catch(err){
            return res.status(400).json({success: false, details: err})
        }
        
        return res.json({success: true, destination, source, amount});
    }
}

export default new AccountsController();