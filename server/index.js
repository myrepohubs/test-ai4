const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

app.use(cors());
app.use(express.json());

// CREATE
app.post("/todos", async (req, res) => {
  try {
    const { title, description, priority, project, due_date } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todo (title, description, priority, project, due_date) VALUES($1, $2, $3, $4, $5) RETURNING *",
      [title, description, priority, project, due_date]
    );
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// READ
app.get("/todos", async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM todo ORDER BY todo_id DESC");
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// UPDATE
app.put("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Dynamic update based on what fields are sent
    const { title, description, priority, project, due_date, is_completed } = req.body;
    
    // Simple full update logic for demo purposes
    if (is_completed !== undefined) {
       await pool.query("UPDATE todo SET is_completed = $1 WHERE todo_id = $2", [is_completed, id]);
    } else {
       await pool.query(
         "UPDATE todo SET title = $1, description = $2, priority = $3, project = $4, due_date = $5 WHERE todo_id = $6",
         [title, description, priority, project, due_date, id]
       );
    }
    res.json("Todo was updated!");
  } catch (err) {
    console.error(err.message);
  }
});

// DELETE
app.delete("/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
    res.json("Todo was deleted!");
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
