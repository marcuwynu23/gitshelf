import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {Dashboard} from "./pages/dashboard/Dashboard";
import {RepoListPage} from "./pages/repo/RepoListPage";
import {RepoDetailPage} from "./pages/repo/RepoDetailPage";
import {Login} from "./pages/auth/Login";
import {Register} from "./pages/auth/Register";
import {Recovery} from "./pages/auth/Recovery";
import {Settings} from "./pages/settings/Settings";
import {Profile} from "./pages/profile/Profile";
import {Notification} from "./pages/notifications/Notification";
import {ProtectedRoute} from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/recovery" element={<Recovery />} />

        {/* Protected Main Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repositories"
          element={
            <ProtectedRoute>
              <RepoListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repository/:name"
          element={
            <ProtectedRoute>
              <RepoDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notification />
            </ProtectedRoute>
          }
        />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
