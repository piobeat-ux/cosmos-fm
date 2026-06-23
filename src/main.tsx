import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)





// Register Service Worker для очистки кэша
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('✅ SW registered:', registration.scope);
      
      // Проверяем обновления каждый час
      setInterval(() => {
        registration.update();
      }, 3600000);
      
      // Если есть новый SW - активируем его
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log(' New SW ready, reloading...');
              window.location.reload();
            }
          });
        }
      });
      
      // Отправляем сообщение для очистки кэша
      if (registration.active) {
        registration.active.postMessage('CLEAR_CACHE');
      }
      
    } catch (error) {
      console.log('⚠️ SW registration failed:', error);
    }
  });
}
