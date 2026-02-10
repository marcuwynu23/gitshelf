import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {Suspense, lazy, useEffect} from "react";
import {useThemeStore} from "./stores/themeStore";
import AboutUs from "./pages/about/AboutUs";

// Lazy load page components for code splitting
const Dashboard = lazy(() =>
  import("./pages/dashboard/Dashboard").then((module) => ({
    default: module.Dashboard,
  })),
);
const RepoListPage = lazy(() =>
  import("./pages/repo/RepoListPage").then((module) => ({
    default: module.RepoListPage,
  })),
);
const RepoDetailPage = lazy(() =>
  import("./pages/repo/RepoDetailPage").then((module) => ({
    default: module.RepoDetailPage,
  })),
);
const Login = lazy(() =>
  import("./pages/auth/Login").then((module) => ({default: module.Login})),
);
const Register = lazy(() =>
  import("./pages/auth/Register").then((module) => ({
    default: module.Register,
  })),
);
const Recovery = lazy(() =>
  import("./pages/auth/Recovery").then((module) => ({
    default: module.Recovery,
  })),
);
const Settings = lazy(() =>
  import("./pages/settings/Settings").then((module) => ({
    default: module.Settings,
  })),
);
const Profile = lazy(() =>
  import("./pages/profile/Profile").then((module) => ({
    default: module.Profile,
  })),
);
const Notification = lazy(() =>
  import("./pages/notifications/Notification").then((module) => ({
    default: module.Notification,
  })),
);
const ActivitiesPage = lazy(() =>
  import("./pages/activity/ActivitiesPage").then((module) => ({
    default: module.ActivitiesPage,
  })),
);
const HelpPage = lazy(() =>
  import("./pages/help/HelpPage").then((module) => ({
    default: module.HelpPage,
  })),
);
const ProtectedRoute = lazy(() =>
  import("./components/ProtectedRoute").then((module) => ({
    default: module.ProtectedRoute,
  })),
);

// Loading component for Suspense fallback
const PageLoading = () => (
  <div className="min-h-screen bg-app-bg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-app-accent mx-auto mb-4"></div>
      <p className="text-text-secondary">Loading...</p>
    </div>
  </div>
);

const App = () => {
  const {initTheme} = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
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
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <ActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <AboutUs />
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
