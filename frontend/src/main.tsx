import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Prevent accidental Caret Browsing toggle (F7 key in Chromium / Edge / Firefox)
window.addEventListener('keydown', (e) => {
  if (e.key === 'F7') {
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
