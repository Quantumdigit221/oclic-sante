import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, AuthState, LoginCredentials } from '../lib/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<AuthState>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isDoctor: () => boolean;
  isReceptionist: () => boolean;
  isPharmacist: () => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: authService.getCurrentUser(),
    token: authService.getToken(),
    isAuthenticated: authService.isAuthenticated(),
    isLoading: false,
    error: null
  });

  useEffect(() => {
    // Temporairement désactivé la validation du token pour éviter les redirections
    // const validateToken = async () => {
    //   if (authState.token) {
    //     setAuthState(prev => ({ ...prev, isLoading: true }));
        
    //     try {
    //       const isValid = await authService.validateToken();
    //       if (!isValid) {
    //         setAuthState({
    //           user: null,
    //           token: null,
    //           isAuthenticated: false,
    //           isLoading: false,
    //           error: 'Session expired. Please login again.'
    //         });
    //       } else {
    //         setAuthState(prev => ({ 
    //           ...prev, 
    //           user: authService.getCurrentUser(),
    //           isLoading: false 
    //         }));
    //       }
    //     } catch (error) {
    //       setAuthState({
    //         user: null,
    //         token: null,
    //         isAuthenticated: false,
    //         isLoading: false,
    //         error: 'Failed to validate session'
    //       });
    //     }
    //   }
    // };

    // validateToken();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AuthState> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await authService.login(credentials);
      setAuthState(result);
      return result;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshProfile = async (): Promise<void> => {
    const user = await authService.getProfile();
    if (user) {
      setAuthState(prev => ({ ...prev, user }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshProfile,
    hasRole: authService.hasRole.bind(authService),
    hasAnyRole: authService.hasAnyRole.bind(authService),
    isAdmin: authService.isAdmin.bind(authService),
    isDoctor: authService.isDoctor.bind(authService),
    isReceptionist: authService.isReceptionist.bind(authService),
    isPharmacist: authService.isPharmacist.bind(authService),
    isSuperAdmin: authService.isSuperAdmin.bind(authService)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
