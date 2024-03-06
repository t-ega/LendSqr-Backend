import { config } from "dotenv";
import knex from "knex";

import knexConfig from "../knex_config";

config();

const { NODE_ENV } = process.env

var env = NODE_ENV || "development";
const db = knex(knexConfig[env]);

export default db;