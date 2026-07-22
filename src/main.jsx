import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

if ('serviceWorker' in navigator) {
  caches.keys().then(names => {
    for (const name of names) {
      if (name.startsWith('Aditya') || name.includes('workbox')) {
        caches.delete(name);
      }
    }
  });
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const reg of registrations) {
      reg.unregister();
    }
    if (registrations.length > 0 && !sessionStorage.getItem('sw-cleared')) {
      sessionStorage.setItem('sw-cleared', '1');
      window.location.reload();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
