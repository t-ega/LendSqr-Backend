import type { Knex } from "knex";


const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql",

    connection: {
      host: "127.0.0.1",
      port: 3000,
      user: "your_database_user",
      password: "your_database_password",
      database: "myapp_test",
    },

    migrations: {
      tableName: "knex_migrations",
      directory: __dirname + "/db/migrations",
    },

    seeds: {
      directory: __dirname + "db/seeds",
    },
  },

  production: {
    client: "mysql",

    connection: process.env.DATABASE_URL,

    migrations: {
      directory: __dirname + "/db/migrations",
    },

    seeds: {
      directory: __dirname + "db/seeds",
    }

  }

};

export default config;
