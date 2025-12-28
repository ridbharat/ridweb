# Schema Management Scripts

This directory contains scripts for managing database schemas from Zod validation schemas.

## Scripts Overview

### 1. `zod-to-mongoose-schema.js`
Converts Zod validation schemas to Mongoose model files.

**Usage:**
```bash
cd schema
node zod-to-mongoose-schema.js
```

**What it does:**
- Reads all `.zod.js` files in the schema directory
- Converts Zod schemas to Mongoose schema definitions
- Generates `.generated.js` files in `schema/models/`
- Includes proper validations, defaults, and indexes

### 2. `create_model_in_mongo.js`
Creates MongoDB collections with JSON schema validation from generated Mongoose models.

**Prerequisites:**
- Create a `.env` file with `MONGO_URI`
- Example: `MONGO_URI=mongodb://localhost:27017/your-database`

**Usage:**
```bash
cd schema
node create_model_in_mongo.js
```

**What it does:**
- Connects to MongoDB using `MONGO_URI`
- Reads generated Mongoose model files
- Converts Mongoose schemas to MongoDB JSON schema validators
- Creates/updates collections with validation rules
- Creates appropriate database indexes

## Schema Pipeline

```
Zod Schemas (.zod.js) → zod-to-mongoose-schema.js → Mongoose Models (.generated.js) → create_model_in_mongo.js → MongoDB Collections
```

## File Structure

```
schema/
├── *.zod.js                 # Zod validation schemas
├── zod-to-mongoose-schema.js # Zod → Mongoose converter
├── create_model_in_mongo.js  # Mongoose → MongoDB converter
├── .env.example             # Environment variables template
└── models/
    └── *.generated.js       # Generated Mongoose models
```

## Usage Workflow

1. **Define/Update Zod schemas** in `*.zod.js` files
2. **Generate Mongoose models:**
   ```bash
   cd schema && node zod-to-mongoose-schema.js
   ```
3. **Setup database validation:**
   ```bash
   cd schema && node create_model_in_mongo.js
   ```

This ensures consistency between API validation, application models, and database constraints.