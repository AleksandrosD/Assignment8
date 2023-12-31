const express = require("express");
const app = express();
const port = 4000;
const { query } = require("./database");
require("dotenv").config();

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`);
  res.on("finish", () => {
    // the 'finish' event will be emitted when the response is handed over to the OS
    console.log(`Response Status: ${res.statusCode}`);
  });
  next();
});
app.use(express.json());

function getNextIdFromCollection(collection) {
  if (collection.length === 0) return 1;
  const lastRecord = collection[collection.length - 1];
  return lastRecord.id + 1;
}

app.get("/", (req, res) => {
  res.send("Welcome to the Books API!!!");
});

// Get all the jobs
app.get("/books", async (req, res) => {
  try {
    const allbooks = await query("SELECT * FROM bookdatabase");
    res.status(200).json(allbooks.rows);
  } catch (err) {
    console.error(err);
  }
});

// Get a specific job
app.get("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  try {
    const book = await query("SELECT * FROM bookdatabase WHERE id = $1", [
      bookId,
    ]);

    if (book.rows.length > 0) {
      res.status(200).json(book.rows[0]);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
    console.error(err);
  }
});

// Create a new job
app.post("/books", async (req, res) => {
  const {
    title,
    author,
    genre,
    quantity
  } = req.body;

  try {
    const newBook = await query(
      "INSERT INTO bookdatabase (title,author,genre,quantity) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        
        title,
        author,
        genre,
        quantity
      ]
    );
    res.status(201).json(newBook.rows[0]);
  } catch (err) {
    console.error(err);
  }
});
// Delete a specific job
// Delete a specific job
app.delete("/books/:id", async (req, res) => {
    const bookId = parseInt(req.params.id, 10);
  
    try {
      const deleteOp = await query("DELETE FROM bookdatabase WHERE id = $1", [
        bookId,
      ]);
  
      if (deleteOp.rowCount > 0) {
        res.status(200).send({ message: "Book deleted successfully" });
      } else {
        res.status(404).send({ message: "Book not found" });
      }
    } catch (err) {
      console.error(err);
    }
  });
  

// Update a specific job
app.patch("/books/:id", async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  const fieldNames = [
    "title",
    "author",
    "genre",
    "id"
   
  ].filter((name) => req.body[name]);

  let updatedValues = fieldNames.map(name => req.body[name]);
  const setValues = fieldNames.map((name, i) => {
    return `${name} = $${i + 1}`
  }).join(', ');

  try {
    const updatedBook = await query(
      `UPDATE bookdatabase SET ${setValues} WHERE id = $${fieldNames.length+1} RETURNING *`,
      [...updatedValues, bookId]
    );

    if (updatedBook.rows.length > 0) {
      res.status(200).json(updatedBook.rows[0]);
    } else {
      res.status(404).send({ message: "Book not found" });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
    console.error(err);
  }
})
app.listen(port, () => {
    //console.log(`Server is running at http://localhost:${port}`);
  });