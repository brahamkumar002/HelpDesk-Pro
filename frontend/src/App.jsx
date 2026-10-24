
import { Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import UserDashboard from './pages/user/UserDashboard';
import MyTickets from './pages/user/MyTickets';
import CreateTicket from './pages/user/CreateTicket';

import AgentDashboard from './pages/agent/AgentDashboard';
import AssignedTickets from './pages/agent/AssignedTickets';

import AdminDashboard from './pages/admin/AdminDashboard';
import AllTickets from './pages/admin/AllTickets';
import ManageAgents from './pages/admin/ManageAgents';
import ManageCategories from './pages/admin/ManageCategories';

import TicketDetails from './pages/tickets/TicketDetails';
import NotFound from './pages/NotFound';

const ROLE_HOME_PATHS = {
  USER: '/user/dashboard',
  AGENT: '/agent/dashboard',
  ADMIN: '/admin/dashboard',
};

function SessionLoader() {
  return (
    <div
      role="status"
      aria-label="Loading your session"
      className="flex min-h-screen items-center justify-center bg-app px-4"
    >
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
        </div>

        <div>
          <p className="font-display text-base font-extrabold text-slate-900">
            HelpDesk Pro
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Loading your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <SessionLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={ROLE_HOME_PATHS[user.role] || '/login'}
      replace
    />
  );
}

function GuestRoute({ children }) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <SessionLoader />;
  }

  if (user) {
    return (
      <Navigate
        to={ROLE_HOME_PATHS[user.role] || '/'}
        replace
      />
    );
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={<HomeRedirect />}
      />

      {/* Public authentication routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* USER protected routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['USER']} />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/user/dashboard"
            element={<UserDashboard />}
          />

          <Route
            path="/user/tickets"
            element={<MyTickets />}
          />

          <Route
            path="/user/tickets/new"
            element={<CreateTicket />}
          />

          <Route
            path="/user/tickets/:id"
            element={<TicketDetails />}
          />
        </Route>
      </Route>

      {/* AGENT protected routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['AGENT']} />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/agent/dashboard"
            element={<AgentDashboard />}
          />

          <Route
            path="/agent/tickets"
            element={<AssignedTickets />}
          />

          <Route
            path="/agent/tickets/:id"
            element={<TicketDetails />}
          />
        </Route>
      </Route>

      {/* ADMIN protected routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']} />
        }
      >
        <Route element={<AppLayout />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/tickets"
            element={<AllTickets />}
          />

          <Route
            path="/admin/tickets/:id"
            element={<TicketDetails />}
          />

          <Route
            path="/admin/agents"
            element={<ManageAgents />}
          />

          <Route
            path="/admin/categories"
            element={<ManageCategories />}
          />
        </Route>
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
