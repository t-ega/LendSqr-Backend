import { Knex } from "knex";

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
        phone_number: string;
        role: typeof UserRoles;
        last_login: Date;
        created_at: Date;
        updated_at: Date;
    }

    interface Account {
      owner: number
      account_number: number
      balance: number
      pin: number
    }
  
  interface Tables {
    users: User
    accounts: Account,
    users_composite: Knex.CompositeTableType<
    User,
    Partial<User>
    >,
    // accounts_composite: Knex.CompositeTableType<
    // Account,
    // Partial<Account>
    // >

    }
}


export { UserRoles }