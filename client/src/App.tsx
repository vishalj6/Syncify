// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AuthRedirect from './pages/AuthRedirect';
import Results from './pages/Results';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth-redirect" element={<AuthRedirect />} />
        <Route path="/results" element={<Results />} /> {/* Add the Results route */}
      </Routes>
    </Router>
  );
};

export default App;
