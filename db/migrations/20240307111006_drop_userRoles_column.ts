import type { Knex } from "knex";
import { UserRoles } from "../../types";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", function(table){
        table.dropColumn("userRoles");
        table.dropColumn("last_login");
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", function(table){
        table.enu("userRoles", Object.values(UserRoles)).notNullable().defaultTo("user");
        table.timestamp("last_login").defaultTo(knex.fn.now());
    });
}

