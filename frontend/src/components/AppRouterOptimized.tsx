import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Role } from '../types';
import { getRoutesForRole } from '../config/routes';

// Composant de chargement optimisé
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
      <p className="text-slate-600">Chargement...</p>
    </div>
  </div>
);

// Composant d'erreur optimisé
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

// Router optimisé avec lazy loading
export const AppRouter: React.FC<{ userRole: Role }> = ({ userRole }) => {
  const routes = getRoutesForRole(userRole);

  return (
    <ErrorBoundary>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <route.component />
              </Suspense>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};
