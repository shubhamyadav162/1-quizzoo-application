const fs = require('fs');
const path = require('path');

// Paths
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');

// Asset directories to clean
const directories = {
  images: path.join(assetsDir, 'images'),
  animations: path.join(assetsDir, 'animations'),
  sounds: path.join(assetsDir, 'sounds'),
  questions: path.join(assetsDir, 'questions')
};

// Allowed file extensions by directory
const allowedExtensions = {
  images: ['.png', '.jpg', '.jpeg', '.webp'],
  animations: ['.json'],
  sounds: ['.mp3'],
  questions: ['.json']
};

// Essential files that should not be removed, even if not used
const essentialFiles = [
  path.join(directories.images, 'craiyon_203413_transparent.png'), // app icon
  path.join(directories.images, 'adaptive-icon.png'),
  path.join(directories.images, 'favicon.png'),
  path.join(directories.images, 'icon.png'),
  path.join(directories.images, 'splash.png')
];

// Function to get file size in MB
const getFileSizeMB = (filePath) => {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024);
};

// Function to clean directory
const cleanDirectory = (dirPath, allowedExts) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  let totalSaved = 0;
  let removedCount = 0;

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    // Skip directories
    if (fs.statSync(filePath).isDirectory()) {
      console.log(`Skipping directory: ${filePath}`);
      return;
    }
    
    // Skip essential files
    if (essentialFiles.includes(filePath)) {
      console.log(`Keeping essential file: ${file}`);
      return;
    }
    
    const ext = path.extname(file).toLowerCase();
    
    // Check if file has allowed extension
    if (!allowedExts.includes(ext)) {
      const fileSize = getFileSizeMB(filePath);
      console.log(`Removing file with disallowed extension: ${file} (${fileSize.toFixed(2)} MB)`);
      fs.unlinkSync(filePath);
      totalSaved += fileSize;
      removedCount++;
    }
    
    // For image files, check size and potentially convert large images
    if (allowedExts.includes(ext) && ext !== '.json') {
      const fileSize = getFileSizeMB(filePath);
      
      // Remove files larger than 1MB (adjust this threshold as needed)
      if (fileSize > 1 && !essentialFiles.includes(filePath)) {
        console.log(`Removing large file: ${file} (${fileSize.toFixed(2)} MB)`);
        fs.unlinkSync(filePath);
        totalSaved += fileSize;
        removedCount++;
      }
    }
  });
  
  console.log(`Cleaned ${dirPath}: Removed ${removedCount} files, saved ~${totalSaved.toFixed(2)} MB`);
};

// Main function
const main = () => {
  console.log('Starting asset cleanup to reduce APK size...');
  
  // Clean each directory
  Object.keys(directories).forEach(dirType => {
    console.log(`Cleaning ${dirType} directory...`);
    cleanDirectory(directories[dirType], allowedExtensions[dirType]);
  });
  
  console.log('Asset cleanup completed!');
};

// Run the main function
main(); 