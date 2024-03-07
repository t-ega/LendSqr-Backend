import { Request, Response } from "express";

import db from "../db/knex";
import { validateUser } from "../validators/create-user.validator";
import ErrorFactory from "../errorFactory.factory";
import UserRepository from "../repositories/users.repository";
import AccountRepository from "../repositories/account.repository";

class UserController {

    constructor(
        private userRepository: UserRepository,
        private accountsRepository: AccountRepository
    ) {}

    /**
   * This controller is responsible for handling user related operations.
   * It is responsible for creating a new user and also fetching a user's details.
   * **Note**: Features such as funding, withdrawal, and transfer are handled by the account controller.
   */

    getUser = async (req: Request, res: Response) : Promise<Response> => {
        /** 
         * For this controller to be called, it would pass through an **auth middleware** which would populate it
         * with the **userId** property.
         * We have overriden the default implementation of the Request module and added a userId field
         * check the **types** file in order to see the extended fields of the Request module
        */
        const userId  = req.userId as number;

        const user = await this.userRepository.getUser(userId);

        const account = await this.accountsRepository.findByOwnerId(userId);

        return res.json({user, account});
    }


    /**
         * Register a new user and then creates an account for them.
         * This method makes use of the transactions feature of knex to ensure that
         * the user and account are created in a single transaction.
         * If either of the operations fail, the entire transaction is rolled back.
    */
    create = async (req: Request, res: Response) => {
    // perform validation
    const { error, value } = validateUser(req.body);


    if (error) {
        return res.status(400).json(ErrorFactory.getError(error.details[0].message));
    }

    // check if the user exists
    const exists = await this.userRepository.getUserByEmailOrPhoneNumber(value.email, value.phone_number);

    if (exists) {
        return res.status(400).json(ErrorFactory.getError("A user with that email or phone number already exists"));
    }

    // perform the transaction
    db.transaction(async (trx) => {
        // destructure the pin from the user object
        const { pin, ...userDto } = value;

        // create the user and the user's account in a db transaction
        await this.userRepository.createUser(trx, userDto);
    
        // MySQL doesn't support returning of columns so we have to query again
        const user = await this.userRepository.getUserByEmailOrPhoneNumber(value.email);
    
        if (user) {
    
            // create an account for that user
            const accountDto = {
                owner: user.id,
                transaction_pin: pin
            };
        
            // create the account while maintaining transaction scope
            const account = await this.accountsRepository.create(trx, accountDto);
            const accountNumber = account?.account_number;

            return res.json({...value, accountNumber, id: user.id});
        }
    })

    }

}

export default UserController;