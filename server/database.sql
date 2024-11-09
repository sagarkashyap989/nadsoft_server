CREATE DATABASE nadsoft;



CREATE TABLE Marks (
    mark_id SERIAL PRIMARY KEY,
    total_marks DECIMAL(5,2) CHECK (total_marks >= 0 AND total_marks <= 100) NOT NULL
);

CREATE TABLE Students (
    student_id SERIAL PRIMARY KEY,  
    name VARCHAR(100) NOT NULL,         
    marks_id INT NOT NULL,            
    gender INT, 
    FOREIGN KEY (marks_id) REFERENCES Marks(mark_id)
);
  
