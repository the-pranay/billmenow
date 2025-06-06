#!/usr/bin/env node

// Simple environment variable test
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from project root
dotenv.config({ path: join(__dirname, '..', '.env.local') });

console.log('🔍 Environment Variable Test');
console.log('=============================');
console.log('Working Directory:', process.cwd());
console.log('Script Directory:', __dirname);
console.log('Env File Path:', join(__dirname, '..', '.env.local'));
console.log('');

console.log('📋 Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI || 'NOT SET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET (hidden)' : 'NOT SET');
console.log('SMTP_USER:', process.env.SMTP_USER || 'NOT SET');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID || 'NOT SET');

if (process.env.MONGODB_URI) {
  console.log('');
  console.log('🔗 MongoDB URI Analysis:');
  const uri = process.env.MONGODB_URI;
  console.log('Length:', uri.length);
  console.log('Starts with mongodb+srv:', uri.startsWith('mongodb+srv:'));
  console.log('Contains billmenow:', uri.includes('billmenow'));
  console.log('Full URI:', uri);
}
