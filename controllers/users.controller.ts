import { Request, Response } from "express";
import db from "../db/knex";
import { validateUser } from "../validators/user.validator";

class UserController {
    /**
   * This class ensures that Users should be able to register,
   *  log in, and access protected resources based on their roles.
   * It achieves role based authentication by using middlewares.
   * Note: This controller doesnt support operations like update/delete on the users model.
   * 
   */

    async getUsers(req: Request, res: Response) : Promise<Response> {
        const users = await db("users").select("*").returning(['first_name', 'last_name', "email", "phone_number"]);

        return res.json(users);
    }

    async create(req: Request, res: Response): Promise<Response> {
    /**
         * Register a new user
    */

    const { error } = validateUser(req.body);
    const {repeat_password, ...data} = req.body;

    if (error) {
        return res.status(400).json({ success: false, details: error.details[0].message });
    }

    const user = await db("users").insert(data);

    return res.json({user});

    }
}

export default new UserController();