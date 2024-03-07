import { Knex } from "knex";
import db from "../db/knex";
import { UserDto } from "../dto/user.dto";
import { User } from "knex/types/tables";

/**
 * UserRepository class encapsulates database operations related to users.
 * This is going to be injected into classess that needs it.
 */
class UserRepository {

    /**
     * Retrieves user details based on the user ID.
     * @param userId The ID of the user to retrieve.
     * @returns A Promise resolving to the user details if found, otherwise undefined.
     */
    async getUserById(userId: number): Promise<Partial<User> | undefined>{
        return await db("users").select("id", "first_name", "last_name", "email", "phone_number")
            .where({ id: userId }).first();
    }

    /**
     * Checks if a user with the given email or phone number exists.
     * @param email The email address to check.
     * @param phoneNumber The phone number to check.
     * @returns A Promise resolving to the user ID if found, otherwise undefined.
     */
    async getUserByEmailOrPhoneNumber(email?: string, phoneNumber?: string): Promise<Pick<User, "id"> | undefined>{
        return await db("users").select("id").where(function() {
            this.where("email", email).orWhere("phone_number", phoneNumber);
        }).first();
    }

    /**
     * Creates a new user in the database.
     * @param trx The Knex transaction object.
     * @param userDto The user data to insert.
     * @returns A Promise resolving to the created user object if successful, otherwise undefined.
     */
    async createUser(trx: Knex.Transaction, userDto: UserDto) : Promise<User | undefined> {
        await trx("users").insert(userDto);
        const user = await trx("users").select().where({ email: userDto.email }).first();
        return user;
    }
}

export default UserRepository;
