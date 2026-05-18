import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './context/AuthContext';

import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/dashboard/Dashboard';
import PatientList from './pages/patients/PatientList';
import Appointments from './pages/appointments/Appointments';
import Treatments from './pages/treatments/Treatments';
import AiDiagnosis from './pages/diagnosis/AiDiagnosis';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import MyHealthHistory from './pages/patients/MyHealthHistory';
import Login from './pages/auth/Login';

// Protected Route Component
const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="app-container" style={{justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return children;
};

// Role-Based Route Component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" />; // Redirect to dashboard if unauthorized

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<RoleRoute allowedRoles={['admin', 'doctor', 'receptionist']}><PatientList /></RoleRoute>} />
        <Route path="appointments" element={<RoleRoute allowedRoles={['admin', 'doctor', 'receptionist', 'patient']}><Appointments /></RoleRoute>} />
        <Route path="treatments" element={<RoleRoute allowedRoles={['admin', 'doctor']}><Treatments /></RoleRoute>} />
        <Route path="ai-diagnosis" element={<RoleRoute allowedRoles={['admin', 'doctor']}><AiDiagnosis /></RoleRoute>} />
        <Route path="reports" element={<RoleRoute allowedRoles={['admin', 'doctor']}><Reports /></RoleRoute>} />
        <Route path="settings" element={<RoleRoute allowedRoles={['admin']}><Settings /></RoleRoute>} />
        <Route path="my-history" element={<RoleRoute allowedRoles={['patient']}><MyHealthHistory /></RoleRoute>} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
