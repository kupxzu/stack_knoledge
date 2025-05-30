import { useState, useEffect } from 'react';

const PWAUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowUpdatePrompt(true);
              setRegistration(reg);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdateClick = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            App Update Available
          </p>
          <p className="text-sm text-blue-200">
            A new version is ready to install
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-200 hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mt-3 flex space-x-2">
        <button
          onClick={handleUpdateClick}
          className="flex-1 bg-white text-blue-600 text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-50 transition-colors"
        >
          Update Now
        </button>
        <button
          onClick={handleDismiss}
          className="flex-1 bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-800 transition-colors"
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;