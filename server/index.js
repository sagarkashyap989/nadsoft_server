const express = require("express");
const app = express();
const cors = require("cors"); 
const {Client} = require("pg");

//middleware
app.use(cors());
app.use(express.json()); //req.body

//ROUTES//

//create a todo

const client = new Client({
  user: "postgres",
  password:"sagar",
  host: "/var/run/postgresql", // Use the socket path instead of "localhost"
  port: 5432,
  database: "perntodo"
})


app.post("/todos", async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await client.query(
      "INSERT INTO todo (description) VALUES($1) RETURNING *",
      [description]
    );

    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//get all todos

app.get("/todos", async (req, res) => {
  try {
    const allTodos = await client.query("SELECT * FROM todo");
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

//get a todo

app.get("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await client.query("SELECT * FROM todo WHERE todo_id = $1", [
      id
    ]);

    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

//update a todo

app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const updateTodo = await client.query(
      "UPDATE todo SET description = $1 WHERE todo_id = $2",
      [description, id]
    );

    res.json("Todo was updated!");
  } catch (err) {
    console.error(err.message);
  }
});

//delete a todo

app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteTodo = await client.query("DELETE FROM todo WHERE todo_id = $1", [
      id
    ]);
    res.json("Todo was deleted!");
  } catch (err) {
    console.log(err.message);
  }
});


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
