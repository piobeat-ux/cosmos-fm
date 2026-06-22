import fs from 'fs';

console.log('🔧 Восстановление HomeSection.tsx...\n');

const homePath = 'src/sections/HomeSection.tsx';
let content = fs.readFileSync(homePath, 'utf-8');

// Remove the broken console.log remnants (lines 110-114)
content = content.replace(/,\n\s*hasValidImage,\n\s*imageLoaded,\n\s*imageError,\n\s*loadAttempts\n\s*\}\);/g, ';');

// Also remove any stray console.log statements
content = content.replace(/console\.log\([^)]*\);?/g, '');

// Clean up multiple empty lines
content = content.replace(/\n{3,}/g, '\n\n');

fs.writeFileSync(homePath, content);
console.log('✅ HomeSection.tsx восстановлен');
console.log('\nЗапустите:');
console.log('  npm run build');
