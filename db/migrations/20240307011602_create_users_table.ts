import type { Knex } from "knex";
import { UserRoles } from "../../types";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', function(table) {
        table.increments("id");
        table.string("first_name", 255).notNullable();
        table.string("last_name", 255).notNullable();
        table.string("email", 100).notNullable();
        table.string("password", 255).notNullable();
        table.string("phone_number", 20).notNullable();
        table.boolean("is_active").defaultTo(true).notNullable();
        table.enu("role", Object.values(UserRoles)).notNullable().defaultTo(UserRoles.REGULAR);
        table.timestamp("last_login").defaultTo(knex.fn.now());
        table.timestamps(true);

    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("users");
}

