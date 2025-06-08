import connectDB, { connectToDatabase } from './database.js';

// Export connectDB as default for compatibility with existing imports
export default connectDB;

// Also export as named export
export { connectDB as dbConnect };
export { connectToDatabase };
