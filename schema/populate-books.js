const mongoose = require('mongoose');
const Book = require('./models/books.generated');
const path = require('path');

// Load environment variables from project root .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// List of PDF files from Backblaze bucket
const pdfFiles = [
  '3000 Daily Use Hindi English Sentence E-Book.pdf',
  '3000 technical words and its meaning (Hindi).pdf',
  '3000 technical words and its meaning((English).pdf',
  'C++ Programming Langauge E-Book.pdf',
  'CSS E-Book.pdf',
  'Computer Fundamentals E-Book.pdf',
  'Computer Network E-Book.pdf',
  'Core Python E-Book.pdf',
  'HTML E-BOOK.pdf',
  'JavaScript E-Book.pdf',
  'Linux E-Book.pdf',
  'RID A-Z English Hindi Dictionary E-Book.pdf',
  'RID A-Z vacubary English-Hindi Words E-Book.pdf',
  'RID Learning English Translation.pdf',
  'azenglish.pdf'
];

// Generate demo data for books
function generateBookData(filename) {
  // Extract title from filename (remove .pdf extension)
  const title = filename.replace('.pdf', '').replace(' E-Book', '').replace(' E-BOOK', '');

  // Determine category based on title keywords
  let category = 'other';
  let tags = [];

  if (title.toLowerCase().includes('hindi') || title.toLowerCase().includes('translation') || title.toLowerCase().includes('dictionary')) {
    category = 'educational';
    tags = ['language', 'hindi', 'english', 'translation'];
  } else if (title.toLowerCase().includes('c++') || title.toLowerCase().includes('python') || title.toLowerCase().includes('javascript') || title.toLowerCase().includes('css') || title.toLowerCase().includes('html')) {
    category = 'technical';
    tags = ['programming', 'coding', 'development'];
  } else if (title.toLowerCase().includes('computer') || title.toLowerCase().includes('network') || title.toLowerCase().includes('linux')) {
    category = 'technical';
    tags = ['computer', 'technology', 'systems'];
  } else if (title.toLowerCase().includes('3000') || title.toLowerCase().includes('words')) {
    category = 'educational';
    tags = ['vocabulary', 'language', 'learning'];
  }

  // Generate description
  const description = `${title} - A comprehensive educational resource covering key concepts and practical knowledge.`;

  // Generate author (demo)
  const authors = ['RID Publications', 'Technical Academy', 'Language Institute', 'Programming Hub'];
  const author = authors[Math.floor(Math.random() * authors.length)];

  // Generate publish year (recent years)
  const publishYear = 2020 + Math.floor(Math.random() * 4); // 2020-2023

  // Generate pages (reasonable range)
  const pages = 50 + Math.floor(Math.random() * 450); // 50-500 pages

  // Generate rating (3.5-5.0)
  const rating = 3.5 + Math.floor(Math.random() * 15) / 10; // 3.5 to 5.0 in 0.1 increments

  return {
    title,
    author,
    description,
    publishYear,
    category,
    tags,
    rating,
    language: title.toLowerCase().includes('hindi') ? 'Hindi/English' : 'English',
    pages,
    pdfFile: {
      filename: filename,
      originalFilename: filename,
      path: `/uploads/pdfs/${filename}`,
      url: `https://your-domain.com/uploads/pdfs/${filename}`,
      size: 1024 * 1024 * (1 + Math.floor(Math.random() * 9)), // 1-10 MB
      contentType: 'application/pdf'
    },
    viewCount: Math.floor(Math.random() * 1000),
    downloadCount: Math.floor(Math.random() * 500),
    isPublished: true,
    isFeatured: Math.random() > 0.7, // 30% chance of being featured
    uploadedBy: '507f1f77bcf86cd799439011' // Demo ObjectId
  };
}

// Save books to database
async function saveBooksToDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const savedBooks = [];

    for (const filename of pdfFiles) {
      try {
        // Check if book already exists
        const existingBook = await Book.findOne({ 'pdfFile.filename': filename });

        if (existingBook) {
          console.log(`⚠️ Book already exists: ${filename}`);
          continue;
        }

        // Generate book data
        const bookData = generateBookData(filename);

        // Create and save book
        const book = new Book(bookData);
        const savedBook = await book.save();

        savedBooks.push(savedBook);
        console.log(`✅ Saved book: ${bookData.title}`);

      } catch (error) {
        console.error(`❌ Error saving book ${filename}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully saved ${savedBooks.length} books to database!`);
    console.log('\n📊 Summary:');
    console.log(`Total files processed: ${pdfFiles.length}`);
    console.log(`Books saved: ${savedBooks.length}`);
    console.log(`Books skipped (already exist): ${pdfFiles.length - savedBooks.length}`);

    // Show sample of saved books
    if (savedBooks.length > 0) {
      console.log('\n📚 Sample saved books:');
      savedBooks.slice(0, 3).forEach(book => {
        console.log(`- "${book.title}" by ${book.author} (${book.category})`);
      });
    }

  } catch (error) {
    console.error('❌ Database operation error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  saveBooksToDatabase().catch(console.error);
}

module.exports = { saveBooksToDatabase, generateBookData };