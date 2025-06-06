import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local');
const result = dotenv.config({ path: envPath });

console.log('🔍 Environment Variable Test (with dotenv)');
console.log('=============================');
console.log('Working Directory:', process.cwd());
console.log('Env File Path:', envPath);
console.log('Dotenv Result:', result.error ? `Error: ${result.error}` : 'Success');

console.log('\n📋 Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID || 'NOT SET');

if (process.env.MONGODB_URI) {
  console.log('\n🔗 MongoDB URI Analysis:');
  console.log('Length:', process.env.MONGODB_URI.length);
  console.log('Starts with mongodb+srv:', process.env.MONGODB_URI.startsWith('mongodb+srv'));
  console.log('Contains billmenow:', process.env.MONGODB_URI.includes('billmenow'));
  console.log('Full URI:', process.env.MONGODB_URI);
}
