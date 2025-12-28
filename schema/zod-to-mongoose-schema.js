const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Load Zod schemas
function loadZodSchemas() {
  const schemas = {};
  const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.zod.js'));

  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    const modelName = file.replace('.zod.js', '');

    try {
      const zodModule = require(filePath);
      // Get the main schema (first export that's a Zod object)
      const zodSchema = Object.values(zodModule).find(val =>
        val && typeof val === 'object' && val._def
      ) || zodModule;

      if (zodSchema && zodSchema._def) {
        schemas[modelName] = zodSchema;
      }
    } catch (error) {
      console.error(`Error loading ${file}:`, error.message);
    }
  });

  return schemas;
}

// Helper to unwrap Zod field to get inner type and collect metadata
function unwrapZodField(zodField) {
  let current = zodField._def;
  let isOptional = false;
  let isNullable = false;
  let defaultValue = undefined;

  while (current) {
    if (current.type === 'optional') {
      isOptional = true;
    } else if (current.type === 'nullable') {
      isNullable = true;
    } else if (current.type === 'default') {
      defaultValue = current.defaultValue;
    } else {
      break;
    }
    current = current.innerType ? current.innerType._def : null;
  }

  return { innerDef: current, isOptional, isNullable, defaultValue };
}

// Convert Zod schema to Mongoose schema
function zodToMongooseSchema(zodSchema) {
  const mongooseSchemaDefinition = {};
  const zodShape = zodSchema._def.shape || {};

  for (const [key, zodField] of Object.entries(zodShape)) {
    const { innerDef, isOptional, isNullable, defaultValue } = unwrapZodField(zodField);

    let mongooseField = {};

    switch (innerDef.type) {
      case 'string':
        mongooseField.type = String;
        if (innerDef.checks) {
          innerDef.checks.forEach(check => {
            if (check.kind === 'min') mongooseField.minlength = check.value;
            if (check.kind === 'max') mongooseField.maxlength = check.value;
            if (check.kind === 'email') mongooseField.match = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          });
        }
        break;
      case 'number':
        mongooseField.type = Number;
        if (innerDef.checks) {
          innerDef.checks.forEach(check => {
            if (check.kind === 'min') mongooseField.min = check.value;
            if (check.kind === 'max') mongooseField.max = check.value;
          });
        }
        break;
      case 'boolean':
        mongooseField.type = Boolean;
        break;
      case 'date':
        mongooseField.type = Date;
        break;
      case 'enum':
        mongooseField.type = String;
        mongooseField.enum = innerDef.entries ? Object.values(innerDef.entries) : [];
        break;
      case 'literal':
        mongooseField.type = typeof innerDef.value;
        mongooseField.enum = [innerDef.value];
        break;
      case 'array':
        mongooseField.type = Array;
        if (innerDef.element) {
          // For arrays, determine if element is primitive or subdocument
          const elementUnwrapped = unwrapZodField(innerDef.element);
          if (elementUnwrapped.innerDef.type === 'object' && elementUnwrapped.innerDef.shape) {
            mongooseField.of = zodToMongooseSchema(innerDef.element);
          } else {
            mongooseField.of = getMongooseType(innerDef.element);
          }
        }
        break;
      case 'object':
        if (innerDef.shape) {
          mongooseField = zodToMongooseSchema(zodField);
        } else {
          mongooseField.type = Object;
        }
        break;
      case 'union':
        // For unions, use Mixed type as fallback
        mongooseField.type = mongoose.Schema.Types.Mixed;
        break;
      default:
        mongooseField.type = String; // fallback
    }

    // Handle required
    if (isOptional || isNullable) {
      mongooseField.required = false;
    } else {
      mongooseField.required = true;
    }

    // Handle defaults
    if (defaultValue !== undefined) {
      mongooseField.default = defaultValue;
    }

    mongooseSchemaDefinition[key] = mongooseField;
  }

  return new mongoose.Schema(mongooseSchemaDefinition, { timestamps: true });
}

// Helper to get Mongoose type for primitives
function getMongooseType(zodField) {
  const { innerDef } = unwrapZodField(zodField);
  switch (innerDef.type) {
    case 'string': return String;
    case 'number': return Number;
    case 'boolean': return Boolean;
    case 'date': return Date;
    case 'enum': return String;
    case 'literal': return typeof innerDef.value;
    default: return String;
  }
}

// Create Mongoose models from Zod schemas
async function createMongooseModels() {
  try {
    const zodSchemas = loadZodSchemas();
    const models = {};

    for (const [modelName, zodSchema] of Object.entries(zodSchemas)) {
      const mongooseSchema = zodToMongooseSchema(zodSchema);

      // Add indexes based on common patterns
      if (mongooseSchema.path('email')) {
        mongooseSchema.index({ email: 1 });
      }
      if (mongooseSchema.path('status')) {
        mongooseSchema.index({ status: 1 });
      }
      if (mongooseSchema.path('createdAt')) {
        mongooseSchema.index({ createdAt: -1 });
      }
      if (mongooseSchema.path('role')) {
        mongooseSchema.index({ role: 1 });
      }
      if (mongooseSchema.path('category')) {
        mongooseSchema.index({ category: 1 });
      }

      // Create model
      models[modelName] = mongoose.model(modelName.charAt(0).toUpperCase() + modelName.slice(1), mongooseSchema);
      console.log(`✅ Created Mongoose model: ${modelName}`);
    }

    return models;
  } catch (error) {
    console.error('❌ Error creating Mongoose models:', error.message);
    throw error;
  }
}

// JSON Schemas inline (since we have Zod files)
const jsonSchemas = {
  users: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 50 },
      lastname: { type: "string", maxLength: 50 },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
      phone: { type: "string" },
      dob: { type: "string", format: "date" },
      gender: { type: "string", enum: ["male", "female", "other"] },
      role: { type: "string", enum: ["student", "teacher", "organisation", "admin"] },
      companyName: { type: "string", maxLength: 100 },
      isActive: { type: "boolean", default: true },
      lastLogin: { type: "string", format: "date-time" },
      profileImage: { type: "string" },
      address: {
        type: "object",
        properties: {
          street: { type: "string", maxLength: 100 },
          city: { type: "string", maxLength: 50 },
          state: { type: "string", maxLength: 50 },
          zipCode: { type: "string", maxLength: 20 },
          country: { type: "string", maxLength: 50 }
        }
      },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    },
    required: ["name", "email", "password", "phone", "role"]
  },
  applications: {
    type: "object",
    properties: {
      appId: { type: "string" },
      applicationType: { type: "string", enum: ["internship", "workshop", "training"] },
      fullName: { type: "string", maxLength: 100 },
      fatherName: { type: "string", maxLength: 100 },
      dob: { type: "string", format: "date" },
      course: { type: "string", maxLength: 100 },
      certificateType: { type: "string", enum: ["CERTIFICATE_OF_COMPLETION", "EXPERIENCE_LETTER", "workshop", "training"] },
      phone: { type: "string" },
      email: { type: "string", format: "email" },
      duration: { type: "number", minimum: 1, maximum: 1000 },
      durationUnit: { type: "string", enum: ["hours", "days", "weeks", "months"] },
      startDate: { type: "string", format: "date" },
      endDate: { type: "string", format: "date" },
      projectName: { type: "string", maxLength: 200 },
      status: { type: "string", enum: ["PENDING", "VERIFIED", "REJECTED"] },
      verifiedAt: { type: "string", format: "date-time" },
      certificatePath: { type: "string" },
      verifiedBy: { type: "string" },
      notes: { type: "string", maxLength: 500 },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    },
    required: ["appId", "applicationType", "fullName", "dob", "certificateType", "phone", "email", "duration", "durationUnit", "startDate", "endDate", "status"]
  },
  books: {
    type: "object",
    properties: {
      title: { type: "string", maxLength: 200 },
      author: { type: "string" },
      description: { type: "string", maxLength: 1000 },
      publishYear: { type: "number", minimum: 1000, maximum: 2026 },
      category: { type: "string", enum: ["technical", "non-technical", "fiction", "non-fiction", "educational", "other"] },
      tags: { type: "array", items: { type: "string", maxLength: 30 } },
      rating: { type: "number", minimum: 1, maximum: 5 },
      language: { type: "string", maxLength: 50 },
      isbn: { type: "string" },
      pages: { type: "number", minimum: 1, maximum: 10000 },
      coverImage: {
        type: "object",
        properties: {
          filename: { type: "string" },
          path: { type: "string" },
          url: { type: "string" },
          size: { type: "number" }
        }
      },
      pdfFile: {
        type: "object",
        properties: {
          filename: { type: "string" },
          originalFilename: { type: "string" },
          path: { type: "string" },
          url: { type: "string" },
          size: { type: "number" },
          contentType: { type: "string" }
        }
      },
      viewCount: { type: "number", minimum: 0 },
      downloadCount: { type: "number", minimum: 0 },
      isPublished: { type: "boolean" },
      isFeatured: { type: "boolean" },
      uploadedBy: { type: "string" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    },
    required: ["title", "author", "description"]
  },
  certificates: {
    type: "object",
    properties: {
      certificateId: { type: "string" },
      applicationId: { type: "string" },
      internName: { type: "string", maxLength: 100 },
      issueDate: { type: "string", format: "date" },
      description: { type: "string", maxLength: 500 },
      certificateFile: {
        type: "object",
        properties: {
          filename: { type: "string" },
          path: { type: "string" },
          url: { type: "string" },
          size: { type: "number", maximum: 10485760 },
          contentType: { type: "string" }
        }
      },
      isActive: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    },
    required: ["certificateId", "internName", "issueDate", "description"]
  }
};

// Load schemas (now inline)
function loadJsonSchemas() {
  return jsonSchemas;
}

// Convert JSON Schema to MongoDB validator format
function convertToMongoValidator(jsonSchema) {
  // MongoDB uses a subset of JSON Schema
  const validator = {
    $jsonSchema: {
      bsonType: 'object',
      ...jsonSchema
    }
  };

  // Remove unsupported properties for MongoDB
  delete validator.$jsonSchema.$schema;
  delete validator.$jsonSchema.$id;
  delete validator.$jsonSchema.title;
  delete validator.$jsonSchema.description;

  // Convert required array to MongoDB format
  if (validator.$jsonSchema.required) {
    // MongoDB uses required in properties, but we can keep it
  }

  return validator;
}

// Generate Mongoose model files from Zod schemas
function generateMongooseModelFiles() {
  const zodSchemas = loadZodSchemas();

  for (const [modelName, zodSchema] of Object.entries(zodSchemas)) {
    const modelCode = generateMongooseModelCode(modelName, zodSchema);
    const filePath = path.join(__dirname, 'models', `${modelName}.generated.js`);

    fs.writeFileSync(filePath, modelCode, 'utf8');
    console.log(`✅ Generated Mongoose model: ${filePath}`);
  }
}

// Generate Mongoose model code from Zod schema
function generateMongooseModelCode(modelName, zodSchema) {
  const capitalModelName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
  const zodShape = zodSchema._def.shape || {};

  let schemaDefinition = '{\n';

  for (const [key, zodField] of Object.entries(zodShape)) {
    const { innerDef, isOptional, isNullable, defaultValue } = unwrapZodField(zodField);
    let fieldOptions = '';

    // Handle nested objects
    if (innerDef.type === 'object' && innerDef.shape) {
      const nestedShape = innerDef.shape;
      let nestedDef = '{\n';
      for (const [nestedKey, nestedField] of Object.entries(nestedShape)) {
        const nestedType = getMongooseType(nestedField);
        const nestedValidations = getValidations(nestedField);
        nestedDef += `    ${nestedKey}: { type: ${nestedType}${nestedValidations} },\n`;
      }
      nestedDef += '  }';
      fieldOptions += `type: ${nestedDef}`;
    } else {
      const fieldType = getMongooseType(zodField);
      fieldOptions += `type: ${fieldType}`;
    }

    // Handle validations and options
    const validations = getValidations(zodField);
    fieldOptions += validations;

    // Handle defaults
    if (defaultValue !== undefined) {
      fieldOptions += `, default: ${JSON.stringify(defaultValue)}`;
    }

    schemaDefinition += `  ${key}: { ${fieldOptions} },\n`;
  }

  schemaDefinition += '}';

  const modelCode = `const mongoose = require('mongoose');

const ${modelName}Schema = new mongoose.Schema(${schemaDefinition}, {
  timestamps: true
});

// Indexes
if (${modelName}Schema.path('email')) ${modelName}Schema.index({ email: 1 });
if (${modelName}Schema.path('status')) ${modelName}Schema.index({ status: 1 });
if (${modelName}Schema.path('createdAt')) ${modelName}Schema.index({ createdAt: -1 });
if (${modelName}Schema.path('role')) ${modelName}Schema.index({ role: 1 });
if (${modelName}Schema.path('category')) ${modelName}Schema.index({ category: 1 });

module.exports = mongoose.model('${capitalModelName}', ${modelName}Schema);
`;

  return modelCode;
}

function getMongooseType(zodField) {
  const { innerDef } = unwrapZodField(zodField);

  switch (innerDef.type) {
    case 'string': return 'String';
    case 'number': return 'Number';
    case 'boolean': return 'Boolean';
    case 'date': return 'Date';
    case 'enum': return 'String';
    case 'literal': return typeof innerDef.value === 'string' ? 'String' : 'Number'; // assuming
    case 'array': return 'Array';
    case 'object': return 'Object';
    default: return 'String';
  }
}

function getValidations(zodField) {
  let options = '';
  const { innerDef, isOptional, isNullable } = unwrapZodField(zodField);

  const checks = innerDef.checks || [];

  checks.forEach(check => {
    switch (check.kind) {
      case 'min':
        if (innerDef.type === 'string') options += `, minlength: ${check.value}`;
        else if (innerDef.type === 'number') options += `, min: ${check.value}`;
        break;
      case 'max':
        if (innerDef.type === 'string') options += `, maxlength: ${check.value}`;
        else if (innerDef.type === 'number') options += `, max: ${check.value}`;
        break;
      case 'email':
        options += `, match: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/`;
        break;
    }
  });

  // Handle enum
  if (innerDef.type === 'enum') {
    const enumValues = innerDef.entries ? Object.values(innerDef.entries) : [];
    options += `, enum: ${JSON.stringify(enumValues)}`;
  }

  // Handle literal
  if (innerDef.type === 'literal') {
    options += `, enum: [${JSON.stringify(innerDef.value)}]`;
  }

  // Handle required
  if (!isOptional && !isNullable) {
    options += ', required: true';
  }

  return options;
}

// Create MongoDB collections with validation
async function createCollectionsWithValidation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const schemas = loadJsonSchemas();

    for (const [collectionName, jsonSchema] of Object.entries(schemas)) {
      const validator = convertToMongoValidator(jsonSchema);

      try {
        // Create collection with validation if it doesn't exist
        const collections = await db.listCollections({ name: collectionName }).toArray();

        if (collections.length === 0) {
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

        // Create indexes based on schema hints
        if (jsonSchema.properties) {
          const indexes = [];

          if (jsonSchema.properties.email) {
            indexes.push({ "email": 1 });
          }
          if (jsonSchema.properties.createdAt) {
            indexes.push({ "createdAt": -1 });
          }
          if (jsonSchema.properties.status) {
            indexes.push({ "status": 1 });
          }
          if (jsonSchema.properties.role) {
            indexes.push({ "role": 1 });
          }
          if (jsonSchema.properties.category) {
            indexes.push({ "category": 1 });
          }

          for (const index of indexes) {
            try {
              await db.collection(collectionName).createIndex(index);
              console.log(`✅ Created index on ${collectionName}:`, index);
            } catch (indexError) {
              console.log(`ℹ️ Index may already exist on ${collectionName}:`, index);
            }
          }
        }

      } catch (error) {
        console.error(`❌ Error setting up ${collectionName}:`, error.message);
      }
    }

    console.log('🎉 All collections created/updated with validation and indexes');

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  // Generate Mongoose model files from Zod schemas
  generateMongooseModelFiles();

  // Optionally create collections with validation
  // createCollectionsWithValidation().catch(console.error);
}

module.exports = { createCollectionsWithValidation, loadJsonSchemas, convertToMongoValidator };