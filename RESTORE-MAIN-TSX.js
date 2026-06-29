import fs from 'fs';

console.log('🔧 Восстановление main.tsx...\n');

const mainContent = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

fs.writeFileSync('src/main.tsx', mainContent);
console.log('✅ main.tsx восстановлен - Service Worker удалён');
console.log('\nЗапустите: npm run dev');
