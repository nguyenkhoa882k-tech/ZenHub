const fs = require('fs');

console.log('🔧 Fixing react-native-sqlite-storage build.gradle...');

const buildGradlePath =
  './node_modules/react-native-sqlite-storage/platforms/android/build.gradle';

if (fs.existsSync(buildGradlePath)) {
  let content = fs.readFileSync(buildGradlePath, 'utf8');

  if (content.includes('jcenter()')) {
    content = content.replace('jcenter()', 'mavenCentral()');
    fs.writeFileSync(buildGradlePath, content, 'utf8');
    console.log('✅ Fixed: replaced jcenter() with mavenCentral()');
  } else {
    console.log('✅ Already fixed!');
  }
} else {
  console.log('⚠️  File not found, skipping fix.');
}
