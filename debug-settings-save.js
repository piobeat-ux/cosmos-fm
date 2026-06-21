import fs from 'fs';

console.log('🔍 Debugging settings save and load...\n');

// 1. Check DataContext - how settings are loaded
console.log('1/3 Checking DataContext.tsx...');
const dataContextPath = 'src/context/DataContext.tsx';
if (fs.existsSync(dataContextPath)) {
  let content = fs.readFileSync(dataContextPath, 'utf-8');
  
  // Check if neppy_image is in default settings
  if (content.includes('neppy_image')) {
    console.log('✅ neppy_image exists in DataContext');
    
    // Show the default settings section
    const settingsMatch = content.match(/settings:\s*{[^}]*neppy_image[^}]*}/s);
    if (settingsMatch) {
      console.log('Default settings:', settingsMatch[0].substring(0, 200));
    }
  } else {
    console.log('❌ neppy_image NOT found in DataContext');
  }
  
  // Check loadData function
  const loadDataMatch = content.match(/getSettings\(\)/);
  if (loadDataMatch) {
    console.log('✅ getSettings() is called in loadData');
  } else {
    console.log('❌ getSettings() NOT called');
  }
}

// 2. Check SettingsPage - how settings are saved
console.log('\n2/3 Checking SettingsPage.tsx...');
const settingsPagePath = 'src/admin/pages/SettingsPage.tsx';
if (fs.existsSync(settingsPagePath)) {
  let content = fs.readFileSync(settingsPagePath, 'utf-8');
  
  // Check if neppy_image field exists
  if (content.includes('neppy_image')) {
    console.log('✅ neppy_image field exists in SettingsPage');
  } else {
    console.log('❌ neppy_image field NOT found in SettingsPage');
  }
  
  // Check if formData includes neppy_image
  const formDataMatch = content.match(/formData.*?neppy_image/s);
  if (formDataMatch) {
    console.log('✅ formData includes neppy_image');
  } else {
    console.log('❌ formData does NOT include neppy_image');
  }
  
  // Check if updateSettings is called with neppy_image
  const updateMatch = content.match(/updateSettings.*?neppy_image/s);
  if (updateMatch) {
    console.log('✅ updateSettings includes neppy_image');
  } else {
    console.log('❌ updateSettings does NOT include neppy_image');
  }
}

// 3. Check supabase.ts - getSettings and updateSetting functions
console.log('\n3/3 Checking lib/supabase.ts...');
const supabasePath = 'src/lib/supabase.ts';
if (fs.existsSync(supabasePath)) {
  let content = fs.readFileSync(supabasePath, 'utf-8');
  
  if (content.includes('getSettings')) {
    console.log('✅ getSettings function exists');
  } else {
    console.log('❌ getSettings function NOT found');
  }
  
  if (content.includes('updateSetting')) {
    console.log('✅ updateSetting function exists');
  } else {
    console.log('❌ updateSetting function NOT found');
  }
}

console.log('\n📋 Что проверить в админке:');
console.log('1. Откройте админку → Настройки');
console.log('2. В поле "Обложка Hero" вставьте URL');
console.log('3. Нажмите кнопку "Сохранить"');
console.log('4. Откройте консоль (F12)');
console.log('5. Посмотрите есть ли сообщения:');
console.log('   - "💾 Updating settings:"');
console.log('   - "💾 Saving \'neppy_image\' = ..."');
console.log('   - "✅ Setting \'neppy_image\' saved"');

console.log('\n🎯 Если сообщений нет - значит кнопка сохранения не работает');
console.log(' Если сообщения есть но neppy_image пустой - проблема в DataContext');
