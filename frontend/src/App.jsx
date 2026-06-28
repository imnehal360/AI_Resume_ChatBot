import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResumeProvider } from './context/ResumeContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ChatBuilder from './pages/ChatBuilder';
import JobRecommendations from './pages/JobRecommendations';
import Profile from './pages/Profile';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

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
