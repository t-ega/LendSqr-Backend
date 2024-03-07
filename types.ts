import { Request } from 'express';
import { Knex } from 'knex';

/**
 *  we are using Object.freeze to make it immutable.
 * @see [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
*/ 
const UserRoles = Object.freeze({
    REGULAR: 'regular',
    ADMIN: 'admin',
});

declare global {
    namespace Express {
      interface Request {
        userId?: number;
      }
    }
  }

declare module 'knex/types/tables' {
    interface User {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        phone_number: string;
        is_active: boolean;
        role: typeof UserRoles;
        last_login: Date;
        created_at: Date;
        updated_at: Date;
    }
  
  interface Tables {
    users: User
    users_composite: Knex.CompositeTableType<User>
    }
}


export { UserRoles }