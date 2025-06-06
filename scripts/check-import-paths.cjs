const fs = require('fs');
const path = require('path');

// Define the project root
const projectRoot = 'd:\\billmenow';
const appDir = path.join(projectRoot, 'app');
const libDir = path.join(appDir, 'lib');

// Function to calculate relative path from source to target
function getRelativePath(sourcePath, targetPath) {
  return path.relative(path.dirname(sourcePath), targetPath);
}

// Get all API route files
function findApiRoutes(dir, routes = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findApiRoutes(filePath, routes);
    } else if (file === 'route.js') {
      routes.push(filePath);
    }
  }
  
  return routes;
}

// Find all API routes
const apiDir = path.join(appDir, 'api');
const apiRoutes = findApiRoutes(apiDir);

console.log('API Route Import Path Analysis:');
console.log('=====================================');

for (const routePath of apiRoutes) {
  const relativePath = getRelativePath(routePath, libDir);
  const normalizedPath = relativePath.replace(/\\/g, '/');
  
  console.log(`File: ${routePath.replace(projectRoot, '')}`);
  console.log(`Import path should be: ${normalizedPath}/database.js`);
  console.log('---');
}
