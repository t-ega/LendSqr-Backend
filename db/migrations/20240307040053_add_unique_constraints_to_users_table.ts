import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", function(table){
        table.string('email').unique().alter();
        table.string("phone_number").unique().alter();
    })
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.alterTable("users", function(table){
        table.dropUnique(["email", "phone_number"]);
    })
}

