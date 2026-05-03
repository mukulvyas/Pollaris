import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import BottomNav from './components/BottomNav';

const Home = lazy(() => import('./pages/Home'));
const Guide = lazy(() => import('./pages/Guide'));
const Candidates = lazy(() => import('./pages/Candidates'));
const Report = lazy(() => import('./pages/Report'));
const Checklist = lazy(() => import('./pages/Checklist'));
const MapPage = lazy(() => import('./pages/Map'));

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Map page crashed:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-[#F5F5F0] p-8 text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <h2 className="font-bold text-gray-800 text-lg mb-2">Map Unavailable</h2>
          <p className="text-sm text-gray-500 mb-6">There was a problem loading the map. Please try again.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-6 py-3 bg-[#F5831F] text-white rounded-xl font-bold"
          >
            Retry
          </button>
          <a
            href="https://electoralsearch.eci.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-[#F5831F] font-bold underline text-sm"
          >
            Find booth on ECI website →
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppLayout = () => {
  return (
    <div className="phone-frame">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header />
      <main id="main-content" className="scroll-area">
        <Suspense fallback={
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/map"
              element={
                <MapErrorBoundary>
                  <MapPage />
                </MapErrorBoundary>
              }
            />
            <Route path="/guide" element={<Guide />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/help" element={<Report />} />
            <Route path="/checklist" element={<Checklist />} />
          </Routes>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppLayout />
  </BrowserRouter>
);

export default App;
