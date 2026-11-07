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

try {
  console.log(
    '%c⚡ DSVERSE Academic Laboratory %c[core::vikas-dev05]',
    'color: #06b6d4; font-weight: bold; font-family: monospace;',
    'color: #64748b; font-size: 9px; font-family: monospace;'
  );
} catch {
  // ignore
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
