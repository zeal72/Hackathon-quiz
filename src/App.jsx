// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { getText } from './config/strings';

import SignupPage from './Pages/SignUp';
import LoginPage from './Pages/SignIn';
import QuizPage from './Pages/QuizPage1';
import ResultsPage from './Pages/Result';
import Leaderboard from './Pages/LeaderBoard';
import { AuthProvider, useAuth } from './Components/AuthContext';

// Get English texts
const text = getText("en");
function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E1B4B]">
        <div className="flex flex-col items-center space-y-4">
          {/* Enhanced Spinner */}
          <div className="relative">
            <svg className="animate-spin h-24 w-24 text-[#6366F1]" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>

            {/* Pulsing center dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="animate-ping h-4 w-4 rounded-full bg-purple-500 opacity-75"></div>
              <div className="absolute top-0 left-0 h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
            </div>
          </div>

          {/* Animated text */}
          <div className="flex flex-col items-center space-y-2">
            <p className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-lg font-semibold">
              {text.loading.message}
            </p>
            <p className="text-purple-300 text-sm">{text.loading.subtext}</p>
            <div className="flex space-x-2">
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-purple-400">{text.auth.redirectNotice}</div>;
  return user ? <Navigate to="/quizpage" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <Navigate to="/signup" replace />
              </PublicRoute>
            }
            aria-label={text.routes.home}
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
            aria-label={text.routes.signup}
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
            aria-label={text.routes.login}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/quizpage"
              element={<QuizPage />}
              aria-label={text.routes.quiz}
            />
            <Route
              path="/resultpage"
              element={<ResultsPage />}
              aria-label={text.routes.results}
            />
            <Route
              path="/leaderboard"
              element={<Leaderboard />}
              aria-label={text.routes.leaderboard}
            />
          </Route>

          <Route
            path="*"
            element={
              <div className="text-center py-20">
                <h1 className="text-4xl text-purple-500 mb-4">{text.errors[404]}</h1>
                <Navigate to="/" replace />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}