import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import HomePage from "./pages/HomePage";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectDetailsPage from "./pages/SubjectDetailsPage";
import CalendarPage from "./pages/CalendarPage";
import WeeklyPlannerPage from "./pages/WeeklyPlannerPage";
import StudyRoomPage from "./pages/StudyRoomPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";

import Layout from "./components/layout/Layout";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {

  const { token } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>

          {/* redirect root */}
          <Route
            path="/"
            element={token ? <Navigate to="/home" /> : <LandingPage />}
          />

          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />

          {/* PROTECTED ROUTES WITH LAYOUT */}
          <Route
            element={
              // eslint-disable-next-line react-hooks/static-components
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<HomePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:id" element={<SubjectDetailsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/planner" element={<WeeklyPlannerPage />} />
            <Route path="/study" element={<StudyRoomPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
