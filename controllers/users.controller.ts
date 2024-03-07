import { Request, Response } from "express";
import db from "../db/knex";
import { validateUser } from "../validators/user.validator";
import { UserDto } from "../dto/user.dto";

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

    const { error } = validateUser(req.body);
    const {repeat_password, ...data} = req.body as UserDto;

    if (error) {
        return res.status(400).json({ success: false, details: error.details[0].message });
    }

    // check if the use exists
    const exists = await db("users").select("id").where({email: data.email, phone_number: data.phone_number}).first();

    if (exists) {
        return res.status(400).json({success: false, details: "A user with that email or phone number already exists"});
    }

    const user = await db("users").insert(data);

    return res.json(data);

    }
}

export default new UserController();