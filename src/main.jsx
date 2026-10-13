import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registrasi Service Worker PWA (Fase 6)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('ServiceWorker CV Mandala Mahardika terdaftar:', reg.scope);
      })
      .catch((err) => {
        console.warn('Registrasi ServiceWorker gagal:', err);
      });
  });
}

