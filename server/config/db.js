const mongoose = require('mongoose');
const seedDataInline = require('../seedHelper');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';

  try {
    // Attempt standard connection with 3-second timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    await seedDataInline();
  } catch (error) {
    console.warn(`\n[Database Warning]: Could not connect to local MongoDB at ${uri} (${error.message}).`);
    console.warn(`Spinning up In-Memory MongoDB Server for zero-config execution...\n`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();

      await mongoose.connect(memUri);
      console.log(`✅ In-Memory MongoDB Connected Successfully at: ${memUri}`);

      // Seed data into memory server
      await seedDataInline();
    } catch (memErr) {
      console.error('Failed to initialize In-Memory MongoDB server:', memErr.message);
    }
  }
};

module.exports = connectDB;
