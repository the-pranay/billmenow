#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 BillMeNow Import Path Fix Script (Corrected)');
console.log('===============================================');

// Define the root directory of the project
const projectRoot = path.resolve(__dirname, '..');
const apiDir = path.join(projectRoot, 'app', 'api');

// Function to get all JavaScript files recursively
function getJSFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getJSFiles(fullPath));
    } else if (item.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to calculate correct import path based on file location
function getLibImportPath(filePath) {
  // Get path from app/api directory
  const relativeFromApi = path.relative(apiDir, filePath);
  const pathParts = relativeFromApi.split(path.sep);
  
  // Remove the filename to get directory depth
  const dirDepth = pathParts.length - 1;
  
  // Need to go up to app directory, then into lib
  // From app/api/* = 2 levels up to app + dirDepth
  const levelsUp = 2 + dirDepth;
  const prefix = '../'.repeat(levelsUp);
  
  return prefix + 'lib/';
}

console.log('📁 Scanning API directory:', apiDir);

try {
  const jsFiles = getJSFiles(apiDir);
  console.log(`📄 Found ${jsFiles.length} JavaScript files to check`);
  
  let totalFixedFiles = 0;
  let totalFixedImports = 0;
  
  for (const filePath of jsFiles) {
    const relativePath = path.relative(projectRoot, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;
    let fileFixed = false;
    let importCount = 0;
    
    const correctLibPath = getLibImportPath(filePath);
    
    console.log(`📁 ${relativePath}: correct lib path = ${correctLibPath}`);
    
    // Fix lib imports with any number of ../
    const libImportRegex = /from ['"]\.\.\/.*?lib\/(database|auth|middleware|models\/\w+)(?:\.js)?['"]/g;
    
    newContent = newContent.replace(libImportRegex, (match, libFile) => {
      const correctedImport = `from '${correctLibPath}${libFile}.js'`;
      console.log(`  📝 ${match} → ${correctedImport}`);
      fileFixed = true;
      importCount++;
      return correctedImport;
    });
    
    if (fileFixed) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`  ✅ Fixed ${importCount} imports in ${relativePath}`);
      totalFixedFiles++;
      totalFixedImports += importCount;
    }
  }
  
  console.log('\n📊 Import Fix Summary');
  console.log('====================');
  console.log(`📄 Files processed: ${jsFiles.length}`);
  console.log(`✅ Files fixed: ${totalFixedFiles}`);
  console.log(`🔧 Total imports fixed: ${totalFixedImports}`);
  
  if (totalFixedFiles > 0) {
    console.log('\n🎉 Import paths have been corrected!');
    console.log('🚀 Ready for Vercel deployment');
  } else {
    console.log('\n✨ All import paths are already correct!');
  }

} catch (error) {
  console.error('❌ Error fixing imports:', error.message);
  process.exit(1);
}