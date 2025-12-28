const mongoose = require('mongoose');
const path = require('path');
// Load environment variables from project root .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import all generated models
const User = require('./models/users.generated');
const Application = require('./models/applications.generated');
const Book = require('./models/books.generated');
const Certificate = require('./models/certificates.generated');
const EbookUser = require('./models/ebookuser.generated');
const Organisation = require('./models/organisation.generated');
const PDF = require('./models/pdf.generated');
const Teacher = require('./models/teacher.generated');
const WorkshopApplication = require('./models/workshop.generated');

// Define indexes to create
const indexesToCreate = [
  // User indexes
  { model: User, indexes: [
    { email: 1 },
    { role: 1 },
    { createdAt: -1 },
    { isActive: 1 }
  ]},

  // Application indexes
  { model: Application, indexes: [
    { email: 1 },
    { status: 1 },
    { createdAt: -1 },
    { applicationType: 1 },
    { appId: 1 }
  ]},

  // Book indexes
  { model: Book, indexes: [
    { title: 'text', author: 'text', description: 'text' },
    { category: 1 },
    { tags: 1 },
    { rating: -1 },
    { createdAt: -1 },
    { isPublished: 1 },
    { uploadedBy: 1 }
  ]},

  // Certificate indexes
  { model: Certificate, indexes: [
    { certificateId: 1 },
    { applicationId: 1 },
    { createdAt: -1 }
  ]},

  // EbookUser indexes
  { model: EbookUser, indexes: [
    { username: 1 },
    { role: 1 },
    { createdAt: -1 },
    { isActive: 1 }
  ]},

  // Organisation indexes
  { model: Organisation, indexes: [
    { email: 1 },
    { createdAt: -1 },
    { role: 1 }
  ]},

  // PDF indexes
  { model: PDF, indexes: [
    { title: 'text', description: 'text' },
    { category: 1 },
    { createdAt: -1 },
    { uploadDate: -1 }
  ]},

  // Teacher indexes
  { model: Teacher, indexes: [
    { email: 1 },
    { createdAt: -1 },
    { role: 1 }
  ]},

  // WorkshopApplication indexes
  { model: WorkshopApplication, indexes: [
    { email: 1 },
    { status: 1 },
    { createdAt: -1 },
    { appId: 1 },
    { certificateType: 1 }
  ]}
];

// Create indexes for all models
async function createIndexes() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.log('⚠️ MONGO_URI not found in environment variables');
      console.log('📝 Please ensure you have a .env file with MONGO_URI set');
      console.log('📋 Skipping database indexing...');
      return;
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB for indexing');

    for (const { model, indexes } of indexesToCreate) {
      const modelName = model.modelName;
      console.log(`\n📊 Creating indexes for ${modelName}...`);

      for (const indexSpec of indexes) {
        try {
          // Handle text indexes differently
          if (indexSpec.hasOwnProperty('$**')) {
            // Text index
            await model.collection.createIndex(indexSpec);
            console.log(`✅ Created text index on ${modelName}`);
          } else {
            // Regular index
            await model.collection.createIndex(indexSpec);
            console.log(`✅ Created index on ${modelName}:`, indexSpec);
          }
        } catch (indexError) {
          if (indexError.code === 85) {
            console.log(`ℹ️ Index already exists on ${modelName}:`, indexSpec);
          } else {
            console.error(`❌ Error creating index on ${modelName}:`, indexError.message);
          }
        }
      }
    }

    console.log('\n🎉 All database indexes created successfully!');

    // Show collection stats
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('\n📈 Database Collections:');
    for (const collection of collections) {
      const stats = await db.collection(collection.name).stats();
      console.log(`- ${collection.name}: ${stats.count} documents`);
    }

  } catch (error) {
    console.error('❌ Database indexing error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createIndexes().catch(console.error);
}

module.exports = { createIndexes };