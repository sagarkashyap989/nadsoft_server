const {Client} = require("pg");
 




const client = new Client({
  user: "postgres",
  password: "sagar",
  host: "localhost",
  port: 5432,
  database: "perntodo"
})
client.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


 client.query("SELECT * FROM todo", (err, res) =>{
  if(!err){
    console.log(res.rows)
  }else{
    console.log(err.message)
  }

  client.end;
 });

module.exports = client








const client = new Client({
  user: "postgres",
  password:"sagar",
  host: "/var/run/postgresql", // Use the socket path instead of "localhost"
  port: 5432,
  // database: "perntodo"
})




app.listen(5000, () => {



  client.connect((err) => {
    if (err) {
      console.error("Database connection failed:", err.stack);
      return;
    }
    console.log("Connected to the database!");
  });
  
  console.log("server has started on port 5000");
});
