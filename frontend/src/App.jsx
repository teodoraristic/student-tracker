import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import SubjectsPage from "./pages/SubjectsPage";
import SubjectDetailsPage from "./pages/SubjectDetailsPage";
import CalendarPage from "./pages/CalendarPage";
import WeeklyPlannerPage from "./pages/WeeklyPlannerPage";
import StudyRoomPage from "./pages/StudyRoomPage";

import Layout from "./components/layout/Layout";

function App() {

  const { token } = useAuth();

  // wrapper za protected route
  const ProtectedRoute = ({ children }) => {
    if (!token) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* redirect root */}
        <Route
          path="/"
          element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
        />

        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* PROTECTED ROUTES WITH LAYOUT */}
        <Route
          element={
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
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
