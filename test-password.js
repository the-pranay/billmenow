// Test password hash verification
import bcrypt from 'bcryptjs';

async function testPassword() {
  const plainPassword = 'demo123';
  const hash = await bcrypt.hash(plainPassword, 12);
  console.log('Generated hash:', hash);
  
  const isValid = await bcrypt.compare(plainPassword, hash);
  console.log('Password validation:', isValid);
  
  // Test a known hash format
  const testHash = await bcrypt.hash('demo123', 12);
  const testValidation = await bcrypt.compare('demo123', testHash);
  console.log('Test validation:', testValidation);
}

testPassword();
