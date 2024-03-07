import { Knex } from "knex";
import { AccountDto } from "../dto/account.dto";
import { Account } from "knex/types/tables";
import db from "../db/knex";
import { UpdateAccountDto } from "../dto/update-account.dto";

class AccountRepository {

    /**
     * Generate an account number starting with `21` with ten digits
     */
    private generateAccountNumber(): number {
         let randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
         // every account number is prefixed with a 21
         const accountNumber =  "21" + randomNumber.toString();
         return parseInt(accountNumber)
    }

    /**
     * This method helps to create an account for a user. 
     * The reason for passing in a transaction object is because, account creation is done every time
     * a user is getting registered. If the registration or account creation fails we should roll back the whole commit
     * @param trx The knex transaction that should be used to create the Account number.
     * @param accountDto 
     * @returns Account | undefined
     */
    async createAccount(trx: Knex.Transaction, accountDto: AccountDto) : Promise<Account | undefined>{
        const account_number = this.generateAccountNumber();
        await trx("accounts").insert({...accountDto, account_number});
        
        // MySQL doesn't support returning of columns so we have to query again
        const account = await trx("accounts").select("*").where({account_number}).first();
        return account;
    }

     /**
     * Retrieves an account by its account number
     * @param accountNumber The account number to retrieve
     * @returns Promise resolving to the account object if found, otherwise null
     */
    async getAccountByNumber(accountNumber: number): Promise<Account | undefined> {
        return await db("accounts").select().where({ account_number: accountNumber }).first();
    }

    async updateAccount(trx: Knex.Transaction, accountDto: UpdateAccountDto){
        const { owner, balance} = accountDto;
        return await trx("accounts").insert({ balance }).where({ owner})
    }

}

export default AccountRepository;
