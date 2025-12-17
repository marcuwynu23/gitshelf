import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {Dashboard} from "./pages/dashboard/Dashboard";
import {RepoListPage} from "./pages/repo/RepoListPage";
import {RepoDetailPage} from "./pages/repo/RepoDetailPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repositories" element={<RepoListPage />} />
        <Route path="/repository/:name" element={<RepoDetailPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
