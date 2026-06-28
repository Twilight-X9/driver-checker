import React from 'react';
import ReactDOM from 'react-dom/client';

// Global patch to prevent Apollo/React DevTools from crashing Tesseract Web Workers
const OriginalBlob = window.Blob;
window.Blob = function(blobParts, options) {
  if (options && (options.type === 'application/javascript' || options.type === 'text/javascript')) {
    const protectiveMock = `
      self.window = self;
      self.chrome = { runtime: { onMessage: { addListener: function(){} } } };
      self.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
      self.__APOLLO_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };
    `;
    blobParts.unshift(protectiveMock);
  }
  return new OriginalBlob(blobParts, options);
};

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
