const pgp = require("pg-promise")(/* options */);
const connection = {
  host: "localhost",
  port: 5432,
  database: "tocre",
  user: "postgres",
  password: "",
};
const db = pgp(connection);

module.exports = db;
