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

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/recovery" element={<Recovery />} />

        {/* Main Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repositories" element={<RepoListPage />} />
        <Route path="/repository/:name" element={<RepoDetailPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notification />} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
