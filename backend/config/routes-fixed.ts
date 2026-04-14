import { lazy } from 'react';
import { Role } from '../types';

// Définition du type pour les routes
interface RouteConfig {
  path: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  exact?: boolean;
  roles?: Role[];
  public?: boolean;
}

// Composant temporaire pour les pages en construction
const ComingSoon = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '400px',
    backgroundColor: '#f8fafc',
    borderRadius: '0.5rem',
    padding: '1.5rem',
  }}>
    <div style={{
      textAlign: 'center',
      padding: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 600,
        color: '#1e293b',
        marginBottom: '0.5rem',
      }}>Page en construction</h2>
      <p style={{ color: '#64748b' }}>Cette fonctionnalité sera bientôt disponible.</p>
    </div>
  </div>
);

// Fonction utilitaire pour créer des composants avec gestion d'erreur
const createLazyComponent = (importFn: () => Promise<any>) => 
  lazy(() => importFn().catch(() => ({ default: ComingSoon })));

// Définition des routes de l'application
export const routes: RouteConfig[] = [
  // Tableau de bord
  {
    path: '/',
    component: lazy(() => import('../pages/Dashboard').then(m => ({ default: m.Dashboard }))),
    exact: true,
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.PHARMACIST, Role.SUPER_ADMIN],
  },
  
  // Gestion des patients
  {
    path: '/patients',
    component: lazy(() => import('../pages/Patients').then(m => ({ default: m.Patients }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },
  {
    path: '/patients/add',
    component: lazy(() => import('../pages/PatientForm').then(m => ({ default: m.PatientForm }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },
  {
    path: '/patients/:id/edit',
    component: lazy(() => import('../pages/PatientForm').then(m => ({ default: m.PatientForm }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },

  // Gestion des services
  {
    path: '/services',
    component: lazy(() => import('../pages/Services').then(m => ({ default: m.Services }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },
  {
    path: '/services/add',
    component: lazy(() => import('../pages/ServiceForm').then(m => ({ default: m.ServiceForm }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },
  {
    path: '/services/:id/edit',
    component: lazy(() => import('../pages/ServiceForm').then(m => ({ default: m.ServiceForm }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },

  // Gestion des tickets
  {
    path: '/tickets',
    component: lazy(() => import('../pages/Tickets').then(m => ({ default: m.Tickets }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },
  {
    path: '/tickets/add',
    component: lazy(() => import('../pages/TicketForm').then(m => ({ default: m.TicketForm }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },
  {
    path: '/tickets/:id/edit',
    component: lazy(() => import('../pages/TicketForm').then(m => ({ default: m.TicketForm }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },

  // Gestion des médicaments
  {
    path: '/medicines',
    component: lazy(() => import('../pages/Medicines').then(m => ({ default: m.Medicines }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },
  {
    path: '/medicines/add',
    component: lazy(() => import('../pages/MedicineForm').then(m => ({ default: m.MedicineForm }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },
  {
    path: '/medicines/:id/edit',
    component: lazy(() => import('../pages/MedicineForm').then(m => ({ default: m.MedicineForm }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST, Role.SUPER_ADMIN],
  },

  // Gestion des utilisateurs
  {
    path: '/users',
    component: lazy(() => import('../pages/Users').then(m => ({ default: m.Users }))),
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    path: '/users/add',
    component: lazy(() => import('../pages/UserForm').then(m => ({ default: m.UserForm }))),
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    path: '/users/:id/edit',
    component: lazy(() => import('../pages/UserForm').then(m => ({ default: m.UserForm }))),
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },

  // Gestion des centres de santé
  {
    path: '/admin/centers',
    component: lazy(() => import('../pages/AdminCenters').then(m => ({ default: m.AdminCenters }))),
    roles: [Role.SUPER_ADMIN],
  },

  // Inscription centre
  {
    path: '/register-center',
    component: lazy(() => import('../pages/RegisterCenter').then(m => ({ default: m.RegisterCenter }))),
    public: true,
  },

  // Gestion Assurance & IMP
  {
    path: '/insurance/dashboard',
    component: lazy(() => import('../pages/InsuranceDashboard').then(m => ({ default: m.InsuranceDashboard }))),
    roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.RECEPTIONIST],
  },
  {
    path: '/insurance/billing',
    component: lazy(() => import('../pages/InsuranceBilling').then(m => ({ default: m.InsuranceBilling }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST],
  },
  {
    path: '/insurance/management',
    component: lazy(() => import('../pages/InsuranceManagement').then(m => ({ default: m.InsuranceManagement }))),
    roles: [Role.ADMIN],
  },
  {
    path: '/insurance/reports',
    component: lazy(() => import('../pages/InsuranceReports').then(m => ({ default: m.InsuranceReports }))),
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
  },
  {
    path: '/insurance/patients',
    component: lazy(() => import('../pages/PatientInsuranceManagement').then(m => ({ default: m.PatientInsuranceManagement }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST],
  },
  {
    path: '/insurance/claims',
    component: lazy(() => import('../pages/InsuranceClaimsManagement').then(m => ({ default: m.InsuranceClaimsManagement }))),
    roles: [Role.ADMIN, Role.DOCTOR, Role.RECEPTIONIST],
  },
];

// Récupère les routes accessibles pour un rôle donné
export const getRoutesForRole = (role: Role) => {
  return routes.filter(route => 
    route.public || (route.roles && route.roles.includes(role))
  );
};

// Route par défaut pour la redirection
export const getDefaultRoute = (role: Role): string => {
  switch (role) {
    case Role.SUPER_ADMIN:
      return '/dashboard';
    case Role.ADMIN:
      return '/dashboard';
    case Role.DOCTOR:
      return '/dashboard';
    case Role.RECEPTIONIST:
      return '/dashboard';
    default:
      return '/dashboard';
  }
};
