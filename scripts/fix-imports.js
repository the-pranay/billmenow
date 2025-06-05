#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const apiDir = path.join(projectRoot, 'app', 'api');

function fixImports(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix lib imports without .js extension
    const patterns = [
      // Database imports
      {
        pattern: /from\s+['"](.+\/lib\/database)['"]/g,
        replacement: "from '$1.js'"
      },
      // Model imports
      {
        pattern: /from\s+['"](.+\/lib\/models\/\w+)['"]/g,
        replacement: "from '$1.js'"
      },
      // Auth imports
      {
        pattern: /from\s+['"](.+\/lib\/auth)['"]/g,
        replacement: "from '$1.js'"
      },
      // Middleware imports
      {
        pattern: /from\s+['"](.+\/lib\/middleware)['"]/g,
        replacement: "from '$1.js'"
      }
    ];

    patterns.forEach(({ pattern, replacement }) => {
      const oldContent = content;
      content = content.replace(pattern, replacement);
      if (oldContent !== content) {
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed imports in: ${path.relative(projectRoot, filePath)}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let fixedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixedCount += walkDirectory(filePath);
    } else if (file.endsWith('.js')) {
      if (fixImports(filePath)) {
        fixedCount++;
      }
    }
  });

  return fixedCount;
}

console.log('🔧 Fixing import statements in API routes...\n');

const fixedCount = walkDirectory(apiDir);

console.log(`\n🎉 Fixed imports in ${fixedCount} files`);
console.log('✅ All import statements now have proper .js extensions');
