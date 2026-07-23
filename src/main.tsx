import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle global cross-origin "Script error." gracefully
if (typeof window !== 'undefined') {
  window.onerror = function (message) {
    if (message === 'Script error.' || message === 'Script error' || (typeof message === 'string' && message.includes('Script error'))) {
      return true;
    }
    return false;
  };

  window.addEventListener('error', (event) => {
    if (event.message === 'Script error.' || event.message?.includes('Script error')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (event.reason.message === 'Script error.' || event.reason.message?.includes('Script error'))) {
      event.preventDefault();
    }
  });
}

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-150 dark:border-gray-700">
            <h2 className="text-xl font-bold text-plum dark:text-plum-fade mb-2">Notice</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-6">
              A temporary display error occurred. Please refresh to restore the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="px-6 py-2.5 bg-plum hover:bg-plum-dark text-white rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
