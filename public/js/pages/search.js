// Get references to the search input and book cards
const searchInput = document.getElementById("searchInput");
const bookCards = document.querySelectorAll(".book-card1");

// Add event listener to search input
searchInput.addEventListener("input", function () {
  const searchTerm = searchInput.value.toLowerCase();

  // Loop through all book cards and filter based on the search term
  bookCards.forEach(function (card) {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const author = card.querySelector("p").textContent.toLowerCase();

    // If the title or author matches the search term, show the card, otherwise hide it
    if (title.includes(searchTerm) || author.includes(searchTerm)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

function openPaymentPrompt(pdfLink) {
  // Show a simple payment prompt (for demo purposes)
  const paymentConfirmed = confirm(
    "To access the eBook, please confirm your payment. Do you want to proceed with the payment?"
  );

  if (paymentConfirmed) {
    // If payment is confirmed, allow the user to download the PDF
    window.location.href = pdfLink;
  } else {
    alert("Payment required to access the eBook.");
  }
}

// Assuming you have a Book model for your collection

const Book = require("./models/Book");

app.get("/search", async (req, res) => {
  const searchQuery = req.query.query;
  try {
    // Perform a case-insensitive search in the 'title' field
    const results = await Book.find({ title: new RegExp(searchQuery, "i") });
    res.render("searchResults", { results, searchQuery });
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).send("An error occurred while searching.");
  }
});
