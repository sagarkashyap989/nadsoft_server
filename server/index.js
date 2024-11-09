const express = require("express");

const bodyParser = require('body-parser');
const app = express();
const cors = require("cors"); 
const client = require('./db')

//middleware
app.use(cors());
app.use(express.json()); //req.body 
app.use(bodyParser.json()); // Parses JSON data
app.use(bodyParser.urlencoded({ extended: true })); 
//ROUTES//

 

app.post("/students", async (req, res) => {
  try {
    // Destructure the request body to get the student data
    const { name, gender} = req.body;
    let marks = req.body.marks

    marks = Number(marks)
    // console.log(!name , gender ===  , marks === undefined, 'helo')
    // Validate input data (you can expand on this as needed)
    if (!name || gender === undefined || gender === null || marks === undefined ) {
      return res.status(400).json({ error: "Missing required fields." });
    }


    if (gender !== 0 && gender !== 1) {
      return res.status(400).json({ error: "Gender must be either 0 or 1." });
    }
    
    // Step 1: Insert marks into the Marks table
    const newMarks = await client.query(
      "INSERT INTO Marks (total_marks) VALUES ($1) RETURNING *",
      [marks]
    );

    const marks_id = newMarks.rows[0].mark_id; // Retrieve the newly created mark_id

    // Step 2: Insert student data into the Students table, with marks_id linking to the Marks table
    const newStudent = await client.query(
      "INSERT INTO Students (name, gender, marks_id) VALUES ($1, $2, $3) RETURNING student_id, name, gender",
      [name, gender, marks_id]
    );

    // Step 3: Return the new student and marks data as the response
    res.json({
      student: newStudent.rows[0],
      marks: newMarks.rows[0]
    });
    
  } catch (err) {
    console.error(err.message);
    // Send error response if any exception occurs
    res.status(500).json({ error: "An error occurred while adding the student and marks." });
  }
});



//get all student
app.get("/students", async (req, res) => {
  const { page, limit } = req.query;
console.log(page, limit) 
  const pageNumber = parseInt(page, 10);
  const pageLimit = parseInt(limit, 10);

  // Calculate the offset
  const offset = (pageNumber - 1) * pageLimit;

  try { 
    const result = await client.query(
      `SELECT 
      s.student_id, 
      s.name, 
      s.gender, 
      m.total_marks 
    FROM 
      Students s
    LEFT JOIN 
      Marks m ON s.marks_id = m.mark_id
    ORDER BY 
      s.student_id ASC 
    LIMIT $1 OFFSET $2`, 
      [pageLimit, offset]  // Pass the limit and offset to the query
    );
 
    const countResult = await client.query(
      `SELECT COUNT(*) FROM Students`
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);

    // Return the results with pagination data
    res.json({
      data: result.rows,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / pageLimit),
        totalCount,
        pageLimit,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "An error occurred while retrieving the student data." });
  }
});

//get a student

app.get("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;  // Extract the student_id from the URL params
 
    const result = await client.query(
      `SELECT 
        s.student_id, 
        s.name, 
        s.gender, 
        m.total_marks 
      FROM 
        Students s
      LEFT JOIN 
        Marks m ON s.marks_id = m.mark_id
      WHERE 
        s.student_id = $1`,   
      [id]  
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json(result.rows[0]);   
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "An error occurred while retrieving the student data." });
  }
});


//update a student

app.put("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gender, marks } = req.body;  // Fields from the request
 
    if (gender !== 0 && gender !== 1) {
      return res.status(400).json({ error: "Gender must be either 0 or 1." });
    }

    let updateQuery = "UPDATE Students SET ";
    let values = [];
    let count = 1;
 
    if (name) {
      updateQuery += `name = $${count}, `;
      values.push(name);
      count++;
    }
 
    if (gender !== undefined) {  
      updateQuery += `gender = $${count}, `;
      values.push(gender);
      count++;
    }
 
    let marks_id;
    if (marks !== undefined) {
      const newMarks = await client.query(
        "INSERT INTO Marks (total_marks) VALUES ($1) RETURNING *",
        [marks]
      );
      marks_id = newMarks.rows[0].mark_id;
      updateQuery += `marks_id = $${count}, `;
      values.push(marks_id);
      count++;
    }
 
    updateQuery = updateQuery.slice(0, -2);
 
    updateQuery += ` WHERE student_id = $${count} RETURNING *`;
    values.push(id);  // Add student_id value to the end of the values array
 
    const updateStudent = await client.query(updateQuery, values);
 
    if (updateStudent.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
 
    res.json({
      message: "Student was updated!",
      student: updateStudent.rows[0],  // Updated student data
      marks: marks_id ? { mark_id: marks_id, total_marks: marks } : null  // Return marks if they were updated
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "An error occurred while updating the student." });
  }
});

//delete a student

app.delete("/students/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const studentResult = await client.query(
      "SELECT marks_id FROM Students WHERE student_id = $1",
      [id]
    );
 
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const marks_id = studentResult.rows[0].marks_id;

    // Delete the student from the Students table
    await client.query("DELETE FROM Students WHERE student_id = $1", [id]);
 
    if (marks_id) {
      await client.query("DELETE FROM Marks WHERE mark_id = $1", [marks_id]);
    }

    // Return success response
    res.json({ message: "Student and associated marks were deleted!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "An error occurred while deleting the student." });
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
