const express = require('express');
const router = express.Router();

// Render Contact Us page
router.get('/', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});




router.post('/submit', (req, res) => {
    const { name, email, number, message } = req.body;
  
    // Log or save the data
    console.log(`Name: ${name}, Email: ${email}, Number: ${number}, Message: ${message}`);
  
    // Optionally save the data to the database (if configured)
  
    // Redirect to a thank-you page or send a success message
    res.send('<h1>Thank you for contacting us!</h1>');
  });

  
  console.log("Contact route hit");


// Render Contact Us page
router.get('/', (req, res) => {
  res.render('contact', { title: 'Contact Us' });
});

module.exports = router;


module.exports = router;
