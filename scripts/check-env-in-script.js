import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '..', '.env.local');
const result = dotenv.config({ path: envPath });

console.log('🔍 Script Environment Check');
console.log('===========================');
console.log('Working Directory:', process.cwd());
console.log('Script Directory:', __dirname);
console.log('Env File Path:', envPath);
console.log('Dotenv Result:', result.error ? `Error: ${result.error}` : 'Success');

console.log('\n📋 Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

if (process.env.MONGODB_URI) {
  console.log('\n🔗 MongoDB URI Check:');
  console.log('URI starts with mongodb+srv:', process.env.MONGODB_URI.startsWith('mongodb+srv'));
  console.log('URI length:', process.env.MONGODB_URI.length);
  console.log('Full URI:', process.env.MONGODB_URI);
} else {
  console.log('\n❌ MONGODB_URI is not set!');
}
