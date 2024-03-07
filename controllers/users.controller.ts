import { Request, Response } from "express";
import db from "../db/knex";
import { validateUser } from "../validators/create-user.validator";
import { UserDto } from "../dto/user.dto";
import { validateUserUpdate } from "../validators/update-user.validator";

class UserController {
    /**
   * This class ensures that Users should be able to register,
   *  log in, and access protected resources based on their roles.
   * It achieves role based authentication by using middlewares.
   * Note: This controller doesnt support operations like update/delete on the users model.
   * 
   */

    async getUsers(req: Request, res: Response) : Promise<Response> {
        /**
         * For you to access This endpoint you must be an Admin
         */
        const users = await db("users").select('first_name', 'last_name', "email",
         "phone_number", "last_login", 'is_active');

        return res.json(users);
    }

    async create(req: Request, res: Response): Promise<Response> {
    /**
         * Register a new user
    */

    // perform validation
    const { error, value } = validateUser(req.body);

    // extract the password and return password from the body of the request
    const {repeat_password, password, ...data} = value as UserDto;

    if (error) {
        return res.status(400).json({ success: false, details: error.details[0].message });
    }

    // check if the user exists
    const exists = await db("users").select("id").where({email: data.email, phone_number: data.phone_number}).first();

    if (exists) {
        return res.status(400).json({success: false, details: "A user with that email or phone number already exists"});
    }

    await db("users").insert({...data, password});

    return res.json(data);

    }

    async updateUser(req: Request, res: Response): Promise<Response> {
        /**
         * For you to access This endpoint you must be an Admin
         */

        const {id} = req.params;

        // perform validation
        const { error, value } = validateUserUpdate(req.body);

        // extract the password and return password from the body of the request
        const {repeat_password, password, ...data} = value as Partial<UserDto>;

        if (error) {
            return res.status(400).json({ success: false, details: error.details[0].message });
        }

        if (!id) return res.status(400).json({success: false, details: "Supply a user id"});

        await db("users").insert(data).where(id);
        return res.json(data); 
    }

    async deleteUser(req: Request, res: Response): Promise<Response> {
        /**
         * For you to access This endpoint you must be an Admin
         */
        
        const {id} = req.params;

        if (!id) return res.status(400).json({success: false, details: "Supply a user id"});

        await db("users").where(id).delete();

        return res.status(204).json();

    }
}

export default new UserController();