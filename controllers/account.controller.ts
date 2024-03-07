import { Request, Response } from "express";
import { DepositFundsDto } from "../dto/deposit.dto";
import db from "../db/knex";

class AccountsController {

    async deposit(req: Request, res: Response): Promise<Response> {
        const userId = req.userId

        const {account_number, amount} = req.body as DepositFundsDto;

        // find account to deposit into
        const account = await db("accounts").select("balance", "owner").where({ owner : userId, account_number }).first();
        if (!account) return res.status(404).json({success: false, details: "Destination account doesnt exist"});

        const updatedBalance = account.balance + amount
        await db("accounts").insert({balance: updatedBalance}).where({ owner: userId });

        return res.json({success: true , details: { account }})

    }
}

export default new AccountsController();