const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directory paths
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'assets');

console.log('Starting optimized APK build...');

// Check if the assets directories exist
const requiredAssetDirs = ['fonts', 'images', 'animations', 'sounds'];
requiredAssetDirs.forEach(dir => {
  const dirPath = path.join(assetsDir, dir);
  if (!fs.existsSync(dirPath)) {
    console.warn(`Warning: Asset directory ${dir} not found. Creating it...`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Run the build command
console.log('Running build with minimal profile...');
const buildProcess = spawn('npx', ['expo', 'build:android', '--profile', 'minimal', '--non-interactive', '--no-wait'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('Build process initiated successfully!');
    console.log('You can monitor the build progress on the Expo dashboard.');
    console.log('Your APK will be available for download once the build completes.');
  } else {
    console.error(`Build process exited with code ${code}`);
    console.log('Trying alternate command with EAS CLI...');
    
    const easBuildProcess = spawn('npx', ['eas', 'build', '-p', 'android', '--profile', 'minimal', '--non-interactive', '--no-wait'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true
    });
    
    easBuildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('EAS build process initiated successfully!');
        console.log('You can monitor the build progress on the EAS dashboard.');
      } else {
        console.error(`EAS build process failed with code ${code}`);
        console.log('Trying local build...');
        
        // Try local build as last resort
        const localBuildProcess = spawn('npx', ['expo', 'prebuild', '--platform', 'android', '--clean'], {
          cwd: projectRoot,
          stdio: 'inherit',
          shell: true
        });
        
        localBuildProcess.on('close', (prebuildCode) => {
          if (prebuildCode === 0) {
            console.log('Prebuild successful, now building APK...');
            const gradleBuild = spawn(process.platform === 'win32' ? 'gradlew.bat' : './gradlew', ['assembleRelease'], {
              cwd: path.join(projectRoot, 'android'),
              stdio: 'inherit',
              shell: true
            });
            
            gradleBuild.on('close', (gradleCode) => {
              if (gradleCode === 0) {
                console.log('Local APK build successful!');
                console.log('Your APK is available at: android/app/build/outputs/apk/release/app-release.apk');
              } else {
                console.error(`Local APK build failed with code ${gradleCode}`);
              }
            });
          } else {
            console.error(`Prebuild failed with code ${prebuildCode}`);
          }
        });
      }
    });
  }
}); 