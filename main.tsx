import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/page';
import { DragDropPolyfill } from './components/drag-drop-polyfill';
import './app/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <DragDropPolyfill />
  </React.StrictMode>
);
