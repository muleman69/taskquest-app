import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole: 'parent' | 'child';
}

export function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { currentUser, userData, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate(`/login/${requiredRole}`);
        return;
      }

      if (userData?.role !== requiredRole) {
        navigate(`/${userData?.role}-dashboard`);
        return;
      }
    }
  }, [currentUser, userData, loading, navigate, requiredRole]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser || userData?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}