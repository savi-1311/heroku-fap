const mysql = require("mysql");
 

const mySqlConnection = mysql.createConnection({

host: "sql12.freemysqlhosting.net",

user: "sql12365075",

password: "tjFVGAFuEI",

database: "sql12365075"

});

 

mySqlConnection.connect(err => {

if (err) console.log(err);

console.log("Database Connected!");

});

 

module.exports = mySqlConnection;
