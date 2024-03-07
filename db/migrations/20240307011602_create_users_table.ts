import type { Knex } from "knex";
import { UserRoles } from "../../types";


export async function up(knex: Knex): Promise<void> {
    knex.schema.createTable('users', function(table) {
        table.increments("id");
        table.string("first_name", 255).notNullable();
        table.string("email", 100).notNullable();
        table.string("password", 255).notNullable(); // this column would contain the hashed version of the password
        table.string("phone_number", 20).notNullable();

        // if the user isnt active they wont be able to carry out operations on their account.
        // e.g The account was suspended because of wrong transfer pin
        table.boolean("is_active").defaultTo(true).notNullable();
        table.enu("role", Object.values(UserRoles)).notNullable().defaultTo(UserRoles.REGULAR);
        table.timestamp("last_login").defaultTo(knex.fn.now());
        table.timestamps(true);

    })
}


export async function down(knex: Knex): Promise<void> {
    knex.schema.dropTable("users");
}

