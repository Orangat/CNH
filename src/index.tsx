import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './tailwind.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Router>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
