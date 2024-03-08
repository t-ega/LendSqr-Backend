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
const knex_1 = __importDefault(require("../db/knex"));
class AccountRepository {
    /**
     * Generate an account number starting with `21` with ten digits
     */
    generateAccountNumber() {
        let randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
        // every account number is prefixed with a 21
        const accountNumber = "21" + randomNumber.toString();
        return parseInt(accountNumber);
    }
    /**
     * This method helps to create an account for a user.
     * The reason for passing in a transaction object is because, account creation is done every time
     * a user is getting registered. If the registration or account creation fails we should roll back the whole commit
     * @param trx The knex transaction that should be used to create the Account number.
     * @param accountDto
     * @returns Account | undefined
     */
    create(trx, accountDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const account_number = this.generateAccountNumber();
            yield trx("accounts").insert(Object.assign(Object.assign({}, accountDto), { account_number }));
            // MySQL doesn't support returning of columns so we have to query again
            const account = yield trx("accounts").select("*").where({ account_number }).first();
            return account;
        });
    }
    /**
    * Retrieves an account by its account number
    * @param accountNumber The account number to retrieve
    * @returns Promise resolving to the account object if found, otherwise null
    */
    find(accountNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, knex_1.default)("accounts").select().where({ account_number: accountNumber }).first();
        });
    }
    /**
     * Retrieves an account by its owner Id
     * @param accountNumber The account number to retrieve
     * @returns Promise resolving to the account object if found, otherwise null
     */
    findByOwnerId(ownerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, knex_1.default)("accounts").select().where({ owner: ownerId }).first();
        });
    }
    update(trx, accountDto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { owner, balance } = accountDto;
            return yield trx("accounts").where({ owner }).update({ balance });
        });
    }
}
exports.default = AccountRepository;
