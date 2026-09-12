import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { ErrorsPage } from '../pages/ErrorsPage';
import { ErrorDetailPage } from '../pages/ErrorDetailPage';
import { MonitorsPage } from '../pages/MonitorsPage';
import { TeamPage } from '../pages/TeamPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/errors" element={<ErrorsPage />} />
          <Route path="/errors/:id" element={<ErrorDetailPage />} />
          <Route path="/monitors" element={<MonitorsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
