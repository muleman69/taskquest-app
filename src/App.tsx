import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { ChildDashboard } from './components/child/ChildDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { PrivateRoute } from './components/auth/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login/parent" element={<LoginPage userType="parent" />} />
      <Route path="/login/child" element={<LoginPage userType="child" />} />
      <Route path="/register/parent" element={<RegisterPage userType="parent" />} />
      <Route path="/register/child" element={<RegisterPage userType="child" />} />
      
      <Route 
        path="/parent-dashboard/*" 
        element={
          <PrivateRoute requiredRole="parent">
            <ParentDashboard />
          </PrivateRoute>
        } 
      />
      
      <Route 
        path="/child-dashboard/*" 
        element={
          <PrivateRoute requiredRole="child">
            <ChildDashboard />
          </PrivateRoute>
        } 
      />
      
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;