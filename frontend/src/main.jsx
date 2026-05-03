import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Force-clear any old buggy Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Old Service Worker cleared');
    }
  });
}

import './utils/firebase';

import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
