import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './Pages/SignUp';
import { motion } from 'framer-motion';
import LoginPage from './Pages/SignIn';
import QuizPage from './Pages/QuizPage1';
import ResultsPage from './Pages/Result';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/quizpage" element={<QuizPage />} />
        <Route path="/resultpage" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
