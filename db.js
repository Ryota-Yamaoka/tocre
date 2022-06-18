const pgp = require("pg-promise")(/* options */);
const connection = {
  host: "localhost",
  port: 5432,
  database: "tocre",
  user: "postgres",
  password: "",
};
const db = pgp(connection);

// DBにデータがないことを判定する関数を定義する
const queryResultCode = pgp.errors.queryResultErrorCode;
const isErrNoData = (error) => {
  return (
    error instanceof pgp.errors.QueryResultError &&
    error.code === queryResultCode.noData
  );
};

module.exports = { db, isErrNoData };
