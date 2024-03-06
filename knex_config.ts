const config = {

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
      directory: __dirname + "/db/migrations",
    },
    seeds: {
      directory: __dirname + "db/seeds",
    },
  },

  production: {
    client: "mysql",
    connection: {
      host: process.env.DB_URL,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: __dirname + "/db/migrations",
    },
    seeds: {
      directory: __dirname + "db/seeds",
    },
  }

};

export default config;
