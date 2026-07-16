const mysql = require("mysql2/promise");

const db = mysql.createPool({
     host : "localhost",
     user : "root",
     password : "11dan12many",
     database : "marketo"
});

module.exports = db;