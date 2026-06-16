// Этот скрипт генерирует PNG иконки из SVG
// Запускается в браузере или через puppeteer
// Для простоты создадим заглушки

import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(process.cwd(), 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Создаем простые PNG заглушки (1x1 пиксель фиолетовый)
// В реальном проекте используйте sharp или canvas
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
  0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
  0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC,
  0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
  0x44, 0xAE, 0x42, 0x60, 0x82
]);

sizes.forEach(size => {
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  // В реальном проекте здесь должна быть генерация PNG нужного размера
  // Пока создаем заглушку
  fs.writeFileSync(filePath, pngHeader);
  console.log(`✅ Создан icon-${size}.png (заглушка)`);
});

console.log('\n⚠️  ВАЖНО: Замените PNG иконки на реальные!');
console.log('Используйте https://realfavicongenerator.net/');
console.log('Или создайте через Figma/Photoshop');
