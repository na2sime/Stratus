import React from 'react';
import ReactDOM from 'react-dom/client';
import { Stratus } from 'stratus';
import App from './app/layout';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Stratus>
      <App />
    </Stratus>
  </React.StrictMode>,
);