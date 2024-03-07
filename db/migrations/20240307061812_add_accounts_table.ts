import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable("accounts", function(table){
        table.integer("owner").unsigned().references("users.id").notNullable().unique();
        table.string("account_number").unique();
        table.double("balance").defaultTo(0.0);
        table.string("transaction_pin").notNullable();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable("accounts");
}

