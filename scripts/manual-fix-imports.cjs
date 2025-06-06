const fs = require('fs');
const path = require('path');

// Correct import paths based on manual analysis
const correctPaths = {
  'app\\api\\admin\\dashboard\\route.js': '../../../lib/',
  'app\\api\\admin\\users\\route.js': '../../../lib/',
  'app\\api\\admin\\users\\[id]\\route.js': '../../../../lib/',
  'app\\api\\auth\\forgot-password\\route.js': '../../../lib/',
  'app\\api\\auth\\login\\route.js': '../../../lib/',
  'app\\api\\auth\\register\\route.js': '../../../lib/',
  'app\\api\\auth\\verify\\route.js': '../../../lib/',
  'app\\api\\clients\\route.js': '../../lib/',
  'app\\api\\clients\\[id]\\route.js': '../../../lib/',
  'app\\api\\dashboard\\route.js': '../../lib/',
  'app\\api\\email\\send\\route.js': '../../../lib/',
  'app\\api\\invoices\\route.js': '../../lib/',
  'app\\api\\invoices\\[id]\\route.js': '../../../lib/',
  'app\\api\\payment\\create-order\\route.js': '../../../lib/',
  'app\\api\\payment\\verify\\route.js': '../../../lib/',
  'app\\api\\payment\\webhook\\route.js': '../../../lib/',
  'app\\api\\reports\\route.js': '../../lib/',
  'app\\api\\user\\profile\\route.js': '../../../lib/'
};

const projectRoot = 'd:\\billmenow';

console.log('🔧 Manual Import Path Fix');
console.log('========================');

for (const [relativePath, correctPath] of Object.entries(correctPaths)) {
  const fullPath = path.join(projectRoot, relativePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${relativePath}`);
    continue;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;
  
  // Replace all lib imports with correct path
  const libImportRegex = /from\s+['"]\.\.\/.*?lib\/([\w\/]+)(?:\.js)?['"]/g;
  
  content = content.replace(libImportRegex, (match, libFile) => {
    const newImport = `from '${correctPath}${libFile}.js'`;
    console.log(`  📝 ${relativePath}: ${match} → ${newImport}`);
    modified = true;
    return newImport;
  });
  
  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  ✅ Fixed ${relativePath}`);
  }
}

console.log('\n🎉 Manual import path fixes complete!');
