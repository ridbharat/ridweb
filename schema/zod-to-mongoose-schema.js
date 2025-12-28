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



// Run if called directly
if (require.main === module) {
  // Generate Mongoose model files from Zod schemas
  generateMongooseModelFiles();
}

module.exports = { generateMongooseModelFiles, loadZodSchemas, zodToMongooseSchema };