import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layout/Layout';
import React, { lazy } from 'react';
import Home from './pages/Home';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ChatBuilder = lazy(() => import('./pages/ChatBuilder'));
const JobRecommendations = lazy(() => import('./pages/JobRecommendations'));
const Profile = lazy(() => import('./pages/Profile'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ResumeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="about" element={<About />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />

                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="chat" element={
                  <ProtectedRoute>
                    <ChatBuilder />
                  </ProtectedRoute>
                } />
                <Route path="recommendations" element={
                  <ProtectedRoute>
                    <JobRecommendations />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </BrowserRouter>
        </ResumeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
