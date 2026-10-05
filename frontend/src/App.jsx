import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MedicalHistoryPage from './pages/MedicalHistoryPage';
import SymptomsTrackerPage from './pages/SymptomsTrackerPage';
import FamilyGeneticPage from './pages/FamilyGeneticPage';
import RecommendedTestsPage from './pages/RecommendedTestsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import MedicalReportsPage from './pages/MedicalReportsPage';
import PatientIdPage from './pages/PatientIdPage';
import FindDoctorsPage from './pages/FindDoctorsPage';
import MedicineStorePage from './pages/MedicineStorePage';
import ProfilePage from './pages/ProfilePage';
import LegalPrivacyPage from './pages/LegalPrivacyPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC] dark:bg-slate-950">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white shadow-xs">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Loading MediCare Hub...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-[#F7F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans">
            <Navbar />
            <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/find-doctors" element={<FindDoctorsPage />} />
              <Route path="/medicine-store" element={<MedicineStorePage />} />
              <Route path="/legal-privacy" element={<LegalPrivacyPage />} />

              {/* Protected Health Modules */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medical-history"
                element={
                  <ProtectedRoute>
                    <MedicalHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/symptoms"
                element={
                  <ProtectedRoute>
                    <SymptomsTrackerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/family-genetic"
                element={
                  <ProtectedRoute>
                    <FamilyGeneticPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/recommended-tests"
                element={
                  <ProtectedRoute>
                    <RecommendedTestsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/medical-reports"
                element={
                  <ProtectedRoute>
                    <MedicalReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient-id"
                element={
                  <ProtectedRoute>
                    <PatientIdPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </AuthProvider>
    </Router>
  </ThemeProvider>
  );
}
