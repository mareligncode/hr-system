import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store.js';
import { SettingsProvider } from './context/SettingsContext.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ErrorBoundary>
            <Provider store={store}>
                <SettingsProvider>
                    <App />
                </SettingsProvider>
            </Provider>
        </ErrorBoundary>
    </StrictMode>,
);
