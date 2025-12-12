const sql = require("mssql");

const config = {
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASS || "aless311214051961",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "CarRental",
  options: {
    trustServerCertificate: true
  }
};

module.exports = sql.connect(config);
