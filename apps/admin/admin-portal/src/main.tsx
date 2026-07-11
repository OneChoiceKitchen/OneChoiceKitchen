import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import './styles.css';       // Global design system — must come first
import './page-defaults.css'; // Brand token cascade for all module pages

import { BrowserRouter } from 'react-router-dom';
import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
