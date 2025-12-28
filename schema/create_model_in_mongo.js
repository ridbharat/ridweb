const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables from project root .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
console.log('🔧 dotenv loaded, checking .env file path...');
console.log('📂 .env file path:', path.join(__dirname, '..', '.env'));
console.log('📋 Current working directory:', process.cwd());

// Load generated Mongoose model files
function loadMongooseModels() {
  const modelsDir = path.join(__dirname, 'models');
  const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.generated.js'));

  const models = {};

  modelFiles.forEach(file => {
    const modelName = file.replace('.generated.js', '');
    const modelPath = path.join(modelsDir, file);

    try {
      // Clear require cache to get fresh model
      delete require.cache[require.resolve(modelPath)];
      const Model = require(modelPath);

      if (Model && Model.schema) {
        models[modelName] = {
          Model,
          schema: Model.schema,
          collectionName: Model.collection.collectionName
        };
      }
    } catch (error) {
      console.error(`Error loading model ${file}:`, error.message);
    }
  });

  return models;
}

// Convert Mongoose schema to MongoDB JSON schema validator
function mongooseSchemaToMongoValidator(mongooseSchema) {
  const paths = mongooseSchema.paths;
  const jsonSchema = {
    bsonType: 'object',
    properties: {},
    required: []
  };

  for (const [pathName, pathObj] of Object.entries(paths)) {
    // Skip mongoose internal fields
    if (pathName === '__v' || pathName === '_id' || pathName === 'createdAt' || pathName === 'updatedAt') {
      continue;
    }

    const fieldSchema = {};

    // Handle different field types (MongoDB supported only)
    if (pathObj.instance === 'String') {
      fieldSchema.bsonType = 'string';
      if (pathObj.options.enum) fieldSchema.enum = pathObj.options.enum;
    } else if (pathObj.instance === 'Number') {
      fieldSchema.bsonType = 'number';
    } else if (pathObj.instance === 'Boolean') {
      fieldSchema.bsonType = 'bool';
    } else if (pathObj.instance === 'Date') {
      fieldSchema.bsonType = 'date';
    } else if (pathObj.instance === 'ObjectId') {
      fieldSchema.bsonType = 'objectId';
    } else if (pathObj.instance === 'Array') {
      fieldSchema.bsonType = 'array';
      if (pathObj.options.type && pathObj.options.type[0]) {
        // Handle array of specific types
        if (pathObj.options.type[0].type === String) {
          fieldSchema.items = { bsonType: 'string' };
        } else if (pathObj.options.type[0].type === Number) {
          fieldSchema.items = { bsonType: 'number' };
        }
      }
    } else if (pathObj.instance === 'Embedded') {
      // Handle embedded documents
      fieldSchema.bsonType = 'object';
    } else {
      // Default to string for unknown types
      fieldSchema.bsonType = 'string';
    }

    // Handle required fields
    if (pathObj.isRequired && !pathObj.options.default) {
      jsonSchema.required.push(pathName);
    }

    // Note: MongoDB JSON schema validation doesn't support defaults
    // Defaults are handled by Mongoose/application layer

    jsonSchema.properties[pathName] = fieldSchema;
  }

  // MongoDB validator format - remove unsupported properties
  const validator = {
    $jsonSchema: {
      bsonType: 'object',
      properties: jsonSchema.properties,
      required: jsonSchema.required
    }
  };

  return validator;
}

// Create MongoDB collections with validation from Mongoose models
async function createCollectionsFromMongooseModels() {
  try {
    console.log('🔍 Checking environment variables...');
    console.log('📄 MONGO_URI from env:', process.env.MONGO_URI ? 'Found' : 'Not found');

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/rid-project-demo';

    if (!process.env.MONGO_URI) {
      console.log('⚠️ MONGO_URI not found in environment variables, using default: mongodb://localhost:27017/rid-project-demo');
      console.log('📝 For production, create a .env file with your MONGO_URI');
    } else {
      console.log('✅ Using MONGO_URI from environment');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const models = loadMongooseModels();

    for (const [modelName, modelData] of Object.entries(models)) {
      const { schema, collectionName } = modelData;
      const validator = mongooseSchemaToMongoValidator(schema);

      try {
        // Check if collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();

        if (collections.length === 0) {
          // Create collection with validation
          await db.createCollection(collectionName, {
            validator: validator,
            validationLevel: 'moderate', // Allow invalid docs but log warnings
            validationAction: 'warn'
          });
          console.log(`✅ Created collection '${collectionName}' with validation`);
        } else {
          // Update existing collection validation
          await db.command({
            collMod: collectionName,
            validator: validator,
            validationLevel: 'moderate',
            validationAction: 'warn'
          });
          console.log(`✅ Updated validation for collection '${collectionName}'`);
        }

        // Create indexes based on schema
        const indexes = [];

        // Email index
        if (schema.path('email')) {
          indexes.push({ email: 1 });
        }

        // Status index
        if (schema.path('status')) {
          indexes.push({ status: 1 });
        }

        // CreatedAt index
        if (schema.path('createdAt')) {
          indexes.push({ createdAt: -1 });
        }

        // Role index
        if (schema.path('role')) {
          indexes.push({ role: 1 });
        }

        // Category index
        if (schema.path('category')) {
          indexes.push({ category: 1 });
        }

        // Apply indexes
        for (const index of indexes) {
          try {
            await db.collection(collectionName).createIndex(index);
            console.log(`✅ Created index on ${collectionName}:`, index);
          } catch (indexError) {
            console.log(`ℹ️ Index may already exist on ${collectionName}:`, index);
          }
        }

      } catch (error) {
        console.error(`❌ Error setting up ${collectionName}:`, error.message);
      }
    }

    console.log('🎉 All collections created/updated with validation and indexes from Mongoose models');

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createCollectionsFromMongooseModels().catch(console.error);
}

module.exports = {
  createCollectionsFromMongooseModels,
  loadMongooseModels,
  mongooseSchemaToMongoValidator
};