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
/**
 * UserRepository class encapsulates database operations related to users.
 * This is going to be injected into classess that needs it.
 */
class UserRepository {
    constructor() {
        /**
         * Checks if a user with the given email or phone number exists.
         * @param email The email address to check.
         * @param phoneNumber The phone number to check.
         * @returns A Promise resolving to the user ID if found, otherwise undefined.
         */
        this.getUserByEmailOrPhoneNumber = (email, phoneNumber) => __awaiter(this, void 0, void 0, function* () {
            let query = (0, knex_1.default)("users").select("id");
            if (email && phoneNumber) {
                query = query.where(function () {
                    this.where("email", email).orWhere("phone_number", phoneNumber);
                });
            }
            else if (email) {
                const r = yield query.where("email", email);
                console.log(r);
                console.log("d");
            }
            else if (phoneNumber) {
                query = query.where("phone_number", phoneNumber);
            }
            else {
                // Handle case when both email and phoneNumber are undefined
                return undefined;
            }
            return yield query.first();
        });
    }
    /**
     * Retrieves user details based on the user ID.
     * @param userId The ID of the user to retrieve.
     * @returns A Promise resolving to the user details if found, otherwise undefined.
     */
    getUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, knex_1.default)("users").select("id", "first_name", "last_name", "email", "phone_number")
                .where({ id: userId }).first();
        });
    }
    /**
     * Creates a new user in the database.
     * @param trx The Knex transaction object.
     * @param userDto The user data to insert.
     * @returns A Promise resolving to the created user object if successful, otherwise undefined.
     */
    createUser(trx, userDto) {
        return __awaiter(this, void 0, void 0, function* () {
            yield trx("users").insert(userDto);
            const user = yield trx("users").select().where({ email: userDto.email }).first();
            return user;
        });
    }
}
exports.default = UserRepository;
