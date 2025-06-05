#!/usr/bin/env node

// Script to list all environment variables from .env.local
import fs from 'fs';
import path from 'path';

function listEnvVars() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ .env.local file not found');
      return;
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    const envVars = [];
    const envValues = {};
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key) {
          envVars.push(key);
          envValues[key] = valueParts.join('=');
        }
      }
    });

    console.log('🔑 Environment Variables Found in .env.local:');
    console.log('='.repeat(50));
    
    // Group by category
    const categories = {
      'Database': ['MONGODB_URI'],
      'JWT': ['JWT_SECRET', 'JWT_EXPIRE'],
      'Razorpay': ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET'],
      'Email': ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS', 'FROM_EMAIL'],
      'Application': ['NEXT_PUBLIC_APP_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'],
      'File Upload': ['UPLOAD_MAX_SIZE', 'ALLOWED_FILE_TYPES'],
      'Rate Limiting': ['RATE_LIMIT_MAX', 'RATE_LIMIT_WINDOW'],
      'Admin': ['ADMIN_EMAIL', 'ADMIN_PASSWORD'],
      'Environment': ['NODE_ENV']
    };

    Object.entries(categories).forEach(([category, keys]) => {
      const foundKeys = keys.filter(key => envVars.includes(key));
      if (foundKeys.length > 0) {
        console.log(`\n📂 ${category}:`);
        foundKeys.forEach(key => {
          const value = envValues[key];
          const maskedValue = key.toLowerCase().includes('secret') || 
                            key.toLowerCase().includes('password') || 
                            key.toLowerCase().includes('key') ?
                            '*'.repeat(Math.min(value.length, 8)) : value;
          console.log(`   ${key} = ${maskedValue}`);
        });
      }
    });

    // List any uncategorized variables
    const categorizedKeys = Object.values(categories).flat();
    const uncategorized = envVars.filter(key => !categorizedKeys.includes(key));
    
    if (uncategorized.length > 0) {
      console.log('\n📋 Other Variables:');
      uncategorized.forEach(key => {
        const value = envValues[key];
        console.log(`   ${key} = ${value}`);
      });
    }

    console.log(`\n📊 Total: ${envVars.length} environment variables`);
    
    // Check for missing required variables
    const requiredVars = [
      'MONGODB_URI', 'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET',
      'SMTP_USER', 'SMTP_PASS', 'NEXTAUTH_SECRET'
    ];
    
    const missingVars = requiredVars.filter(key => !envVars.includes(key) || !envValues[key] || envValues[key].startsWith('your-'));
    
    if (missingVars.length > 0) {
      console.log('\n⚠️  Variables that need configuration:');
      missingVars.forEach(key => {
        console.log(`   ${key}`);
      });
    } else {
      console.log('\n✅ All required variables are configured');
    }

  } catch (error) {
    console.error('❌ Error reading .env.local:', error.message);
  }
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if running directly
if (process.argv[1] === __filename) {
  listEnvVars();
}

export default listEnvVars;
