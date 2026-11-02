import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import './App.css';

// Pages matching the exact university video demo
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import IdeasPage from './pages/IdeasPage';
import SubmitIdeaPage from './pages/SubmitIdeaPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Toast from './components/Toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-layout">
          {/* Global Floating Toast Alerts (Network / Offline) */}
          <Toast />

          {/* Top Navbar */}
          <Navbar />

          {/* Main Views */}
          <main className="app-main">
            <Routes>
              {/* Core Demonstrated Navigation Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/ideas" element={<IdeasPage />} />
              
              {/* Submit Ideas (Protected / alerts guest) */}
              <Route path="/submit-idea" element={<SubmitIdeaPage />} />

              {/* Profile */}
              <Route path="/profile" element={<ProfilePage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Admin Control Center (Strictly Protected by AdminRoute) */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Aliases & Fallbacks */}
              <Route path="/trending" element={<Navigate to="/ideas" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Universal Footer */}
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
