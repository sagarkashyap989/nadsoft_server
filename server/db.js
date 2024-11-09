const {Client} = require("pg");
 




const client = new Client({
  user: "postgres",
  password:"sagar",
  host: "/var/run/postgresql",
  port: 5432,
  database: "nadsoft"
})
module.exports = client






