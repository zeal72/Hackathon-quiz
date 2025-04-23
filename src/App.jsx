// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import SignupPage from './Pages/SignUp';
import LoginPage from './Pages/SignIn';
import QuizPage from './Pages/QuizPage1';
import ResultsPage from './Pages/Result';
import Leaderboard from './Pages/LeaderBoard';

import { AuthProvider, useAuth } from './Components/AuthContext';  // adjust path if needed

// A wrapper for routes that require auth
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    // While checking auth status, show a spinner
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not logged in, redirect to login
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// A wrapper for routes that should be hidden from signed-in users
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or spinner
  }
  return user ? <Navigate to="/quizpage" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Default: redirect root → signup (or quiz if already logged in) */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Navigate to="/signup" replace />
              </PublicRoute>
            }
          />

          {/* Public routes */}
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/quizpage" element={<QuizPage />} />
            <Route path="/resultpage" element={<ResultsPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
