const Book = require("../models/ebookModel");
app.use(express.static(path.join(__dirname, "public")));

// Fetch all books and render the eBook list
exports.getEbooks = async (req, res) => {
  try {
    const books = await Book.find(); // Fetch all books from the database
    res.render("ebook", { books }); // Render eBook list with dynamic data
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).send("Server error");
  }
};

// Fetch details of a specific book
exports.getBookDetails = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send("Book not found");
    }
    res.render("bookDetails", { book }); // Render book details page
  } catch (error) {
    console.error("Error fetching book details:", error);
    res.status(500).send("Server error");
  }
};

// Add a new book to the database
exports.addBook = async (req, res) => {
  try {
    const newBook = new Book({
      title: req.body.title,
      year: req.body.year,
      pdfUrl: req.body.pdfUrl,
      coverImage: req.body.coverImage,
    });
    await newBook.save();
    res.redirect("/ebook"); // Redirect to the eBook list
  } catch (error) {
    console.error("Error uploading book:", error);
    res.status(500).send("Server error");
  }
};
