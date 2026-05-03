import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (or a service like Firebase Analytics)
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('app_error', { error: error.toString(), info: errorInfo.componentStack });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
          <div className="text-6xl mb-4">🙏</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6 max-w-xs mx-auto">
            We encountered an unexpected error. Please try refreshing the app.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-[#F5831F] text-white rounded-full font-bold shadow-lg"
          >
            Refresh App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
