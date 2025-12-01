const Pool = require("pg").Pool;

const pool = new Pool({
  user: "test_user",
  password: "password",
  host: "localhost",
  port: 5432,
  database: "test_lite_db"
});

module.exports = pool;
