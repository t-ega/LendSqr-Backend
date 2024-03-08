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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const knex_1 = __importDefault(require("../db/knex"));
const create_user_validator_1 = require("../validators/create-user.validator");
const errorFactory_factory_1 = __importDefault(require("../errorFactory.factory"));
class UserController {
    constructor(userRepository, accountsRepository) {
        this.userRepository = userRepository;
        this.accountsRepository = accountsRepository;
        /**
       * This controller is responsible for handling user related operations.
       * It is responsible for creating a new user and also fetching a user's details.
       * **Note**: Features such as funding, withdrawal, and transfer are handled by the account controller.
       */
        this.getUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            /**
             * For this controller to be called, it would pass through an **auth middleware** which would populate it
             * with the **userId** property.
             * We have overriden the default implementation of the Request module and added a userId field
             * check the **types** file in order to see the extended fields of the Request module
            */
            const userId = req.userId;
            const user = yield this.userRepository.getUser(userId);
            const account = yield this.accountsRepository.findByOwnerId(userId);
            return res.json({ user, account });
        });
        /**
             * Register a new user and then creates an account for them.
             * This method makes use of the transactions feature of knex to ensure that
             * the user and account are created in a single transaction.
             * If either of the operations fail, the entire transaction is rolled back.
        */
        this.create = (req, res) => __awaiter(this, void 0, void 0, function* () {
            // perform validation
            const { error, value } = (0, create_user_validator_1.validateUser)(req.body);
            if (error) {
                return res.status(400).json(errorFactory_factory_1.default.getError(error.details[0].message));
            }
            // check if the user exists
            const exists = yield this.userRepository.getUserByEmailOrPhoneNumber(value.email, value.phone_number);
            if (exists) {
                return res.status(400).json(errorFactory_factory_1.default.getError("A user with that email or phone number already exists"));
            }
            // perform the transaction
            const result = yield knex_1.default.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                // destructure the pin from the user object
                const { pin } = value, userDto = __rest(value, ["pin"]);
                // create the user and the user's account in a db transaction
                const user = yield this.userRepository.createUser(trx, userDto);
                if (!user) {
                    throw new Error("An error occurred while creating the user");
                }
                const saltOrRounds = 10;
                const hashedPin = yield bcrypt_1.default.hash(pin, saltOrRounds);
                const accountDto = {
                    owner: user.id,
                    transaction_pin: hashedPin
                };
                // create an account for that user
                // create the account while maintaining transaction scope
                const account = yield this.accountsRepository.create(trx, accountDto);
                const accountNumber = account === null || account === void 0 ? void 0 : account.account_number;
                return Object.assign(Object.assign({ id: user.id }, userDto), { accountNumber });
            }));
            return res.json(result);
        });
    }
}
exports.default = UserController;
