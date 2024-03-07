import { Request, Response } from "express";
import db from "../db/knex";
import { validateUser } from "../validators/create-user.validator";
import accountController from "./account.controller";

class UserController {
    /**
   * This class ensures that Users should be able to register,
   *  log in, and access protected resources based on their roles.
   * It achieves role based authentication by using middlewares.
   * Note: This controller doesnt support operations like update/delete on the users model.
   * 
   */

    async getUser(req: Request, res: Response) : Promise<Response> {
        /** 
         * For this controller to be called, it would pass through an **auth middleware** which would populate it
         * with the **userId** property.
         * We have overriden the default implementation of the Request module and added a userId field
         * check the **types** file in order to see the extended fields of the Request module
        */
        const { userId } = req;

        const user = await db("users").select('first_name', 'last_name', "email",
         "phone_number", "last_login").where({id: userId}).first();

        return res.json(user);
    }


    async create(req: Request, res: Response): Promise<Response> {
    /**
         * Register a new user and then creates an account for them.
    */

    // perform validation
    const { error, value } = validateUser(req.body);


    if (error) {
        return res.status(400).json({ success: false, details: error.details[0].message });
    }

    // check if the user exists
    const exists = await db("users").select("id").where({email: value.email, phone_number: value.phone_number}).first();

    if (exists) {
        return res.status(400).json({success: false, details: "A user with that email or phone number already exists"});
    }

    await db("users").insert({...value}).first();

    // MySQL doesn't support returning of columns so we have to query again
    const user = await db("users").select().where({email: value.email}).first();

    if (user) {

        // create an account for that user
        const accountDto = {
            owner: user.id,
            pin: value.pin
        };
    
        const account = await accountController.createAccount(accountDto);
        return res.json(...value, account?.account_number);
    }

    return res.json(...value);

    }

}

export default new UserController();