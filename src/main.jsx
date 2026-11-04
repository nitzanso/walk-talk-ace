import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/varela-round/400.css';
import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import './styles.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
