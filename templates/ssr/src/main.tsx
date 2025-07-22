import React from 'react';
import ReactDOM from 'react-dom/client';
import { Stratus, ServiceContainer } from 'stratus';
import { HttpService } from './services/ApiService';
import App from './app/layout';
import './index.css';

// Initialize service container
const serviceContainer = new ServiceContainer();

// Register services
serviceContainer.register('httpService', () => new HttpService());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Stratus serviceContainer={serviceContainer}>
      <App />
    </Stratus>
  </React.StrictMode>,
);