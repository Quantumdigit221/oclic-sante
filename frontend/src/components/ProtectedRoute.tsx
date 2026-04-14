import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../store';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredRoles?: Role[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiredRoles,
  fallback = <Navigate to="/login" replace />
}) => {
  const { currentUser, isLoading } = useStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAuthenticated = !!currentUser;
  const hasRoleCheck = (role: string) => currentUser?.role === role;
  const hasAnyRoleCheck = (roles: string[]) => currentUser?.role ? roles.includes(currentUser.role) : false;

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  if (requiredRole && !hasRoleCheck(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <p className="text-xs text-gray-500 mt-2">Rôle requis: {requiredRole}, votre rôle: {currentUser?.role}</p>
        </div>
      </div>
    );
  }

  if (requiredRoles && !hasAnyRoleCheck(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <p className="text-xs text-gray-500 mt-2">Rôles requis: {requiredRoles.join(', ')}, votre rôle: {currentUser?.role}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Specific role-based protected routes
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={Role.ADMIN}>{children}</ProtectedRoute>
);

export const DoctorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={Role.DOCTOR}>{children}</ProtectedRoute>
);

export const ReceptionistRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={Role.RECEPTIONIST}>{children}</ProtectedRoute>
);

export const PharmacistRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={Role.PHARMACIST}>{children}</ProtectedRoute>
);

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole={Role.SUPER_ADMIN}>{children}</ProtectedRoute>
);

// Multiple roles route
export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute 
    requiredRoles={[Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.PHARMACIST]}
  >
    {children}
  </ProtectedRoute>
);
