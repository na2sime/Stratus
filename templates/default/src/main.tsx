import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppRouter, ServiceProvider, ServiceContainer } from '@wizecorp/stratusjs';
import { HttpService } from './services/ApiService';
import './index.css';

// Initialize service container
const serviceContainer = new ServiceContainer();

// Register services
serviceContainer.register('httpService', () => new HttpService());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ServiceProvider container={serviceContainer}>
      <AppRouter />
    </ServiceProvider>
  </React.StrictMode>,
);