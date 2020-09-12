const mysql = require("mysql");
 

const mySqlConnection = mysql.createConnection({

host: "sql12.freemysqlhosting.net",

user: "sql12330963",

password: "YKsJX1VV79",

database: "sql12330963"

});

 

mySqlConnection.connect(err => {

if (err) console.log(err);

console.log("Database Connected!");

});

 

module.exports = mySqlConnection;
