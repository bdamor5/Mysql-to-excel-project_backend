let mysql = require("mysql");

var con = mysql.createConnection({
  host: "prod-garageworks.ccfcnwudqgxr.ap-south-1.rds.amazonaws.com",
  user: "gw_admin",
  password: "Xopvum-vuwrax-nyxse3",
  database: "beta",
});

module.exports = con;
