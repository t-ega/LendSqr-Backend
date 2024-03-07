import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", function(table){
        table.dropColumn("password");
        table.dropColumn("isActive");

    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", function(table){
        table.string("password", 255).notNullable();
        table.boolean("is_active").defaultTo(true).notNullable();
    })
}

