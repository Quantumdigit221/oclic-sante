import { Role } from '../lib/types';

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  roles?: Role[];
}

export const getRoutesForRole = (role: Role): RouteConfig[] => {
  const commonRoutes: RouteConfig[] = [
    { path: '/dashboard', component: () => import('../pages/Dashboard').then(m => ({ default: m.Dashboard })) },
    { path: '/profile', component: () => import('../pages/Profile').then(m => ({ default: m.Profile })) },
  ];

  switch (role) {
    case Role.SUPER_ADMIN:
      return [
        ...commonRoutes,
        { path: '/super-admin', component: () => import('../pages/SuperAdmin').then(m => ({ default: m.SuperAdmin })) },
        { path: '/user-management', component: () => import('../pages/UserManagement').then(m => ({ default: m.UserManagement })) },
        { path: '/admin-center', component: () => import('../pages/AdminCenter').then(m => ({ default: m.AdminCenter })) },
        { path: '/patients', component: () => import('../pages/Patients').then(m => ({ default: m.Patients })) },
        { path: '/patients/:id', component: () => import('../pages/PatientDetails').then(m => ({ default: m.PatientDetails })) },
        { path: '/consultations', component: () => import('../pages/Consultations').then(m => ({ default: m.Consultations })) },
        { path: '/pharmacy', component: () => import('../pages/Pharmacy').then(m => ({ default: m.Pharmacy })) },
        { path: '/services', component: () => import('../pages/Services').then(m => ({ default: m.Services })) },
        { path: '/staff', component: () => import('../pages/Staff').then(m => ({ default: m.Staff })) },
        { path: '/reports', component: () => import('../pages/Reports').then(m => ({ default: m.Reports })) },
        { path: '/tickets', component: () => import('../pages/Tickets').then(m => ({ default: m.Tickets })) },
        { path: '/diagnosis-ai', component: () => import('../pages/DiagnosisAI').then(m => ({ default: m.DiagnosisAI })) },
        { path: '/vision-test', component: () => import('../pages/VisionTest').then(m => ({ default: m.VisionTest })) },
        { path: '/free-vision-test', component: () => import('../pages/FreeVisionTest').then(m => ({ default: m.FreeVisionTest })) },
        { path: '/medical-image-test', component: () => import('../pages/MedicalImageTest').then(m => ({ default: m.MedicalImageTest })) },
      ];

    case Role.ADMIN:
      return [
        ...commonRoutes,
        { path: '/admin-center', component: () => import('../pages/AdminCenter').then(m => ({ default: m.AdminCenter })) },
        { path: '/patients', component: () => import('../pages/Patients').then(m => ({ default: m.Patients })) },
        { path: '/patients/:id', component: () => import('../pages/PatientDetails').then(m => ({ default: m.PatientDetails })) },
        { path: '/consultations', component: () => import('../pages/Consultations').then(m => ({ default: m.Consultations })) },
        { path: '/pharmacy', component: () => import('../pages/Pharmacy').then(m => ({ default: m.Pharmacy })) },
        { path: '/services', component: () => import('../pages/Services').then(m => ({ default: m.Services })) },
        { path: '/staff', component: () => import('../pages/Staff').then(m => ({ default: m.Staff })) },
        { path: '/reports', component: () => import('../pages/Reports').then(m => ({ default: m.Reports })) },
        { path: '/tickets', component: () => import('../pages/Tickets').then(m => ({ default: m.Tickets })) },
        { path: '/diagnosis-ai', component: () => import('../pages/DiagnosisAI').then(m => ({ default: m.DiagnosisAI })) },
        { path: '/vision-test', component: () => import('../pages/VisionTest').then(m => ({ default: m.VisionTest })) },
        { path: '/free-vision-test', component: () => import('../pages/FreeVisionTest').then(m => ({ default: m.FreeVisionTest })) },
        { path: '/medical-image-test', component: () => import('../pages/MedicalImageTest').then(m => ({ default: m.MedicalImageTest })) },
      ];

    case Role.DOCTOR:
      return [
        ...commonRoutes,
        { path: '/patients', component: () => import('../pages/Patients').then(m => ({ default: m.Patients })) },
        { path: '/patients/:id', component: () => import('../pages/PatientDetails').then(m => ({ default: m.PatientDetails })) },
        { path: '/consultations', component: () => import('../pages/Consultations').then(m => ({ default: m.Consultations })) },
        { path: '/pharmacy', component: () => import('../pages/Pharmacy').then(m => ({ default: m.Pharmacy })) },
        { path: '/services', component: () => import('../pages/Services').then(m => ({ default: m.Services })) },
        { path: '/tickets', component: () => import('../pages/Tickets').then(m => ({ default: m.Tickets })) },
        { path: '/diagnosis-ai', component: () => import('../pages/DiagnosisAI').then(m => ({ default: m.DiagnosisAI })) },
        { path: '/vision-test', component: () => import('../pages/VisionTest').then(m => ({ default: m.VisionTest })) },
        { path: '/free-vision-test', component: () => import('../pages/FreeVisionTest').then(m => ({ default: m.FreeVisionTest })) },
        { path: '/medical-image-test', component: () => import('../pages/MedicalImageTest').then(m => ({ default: m.MedicalImageTest })) },
      ];

    case Role.PHARMACIST:
      return [
        ...commonRoutes,
        { path: '/pharmacy', component: () => import('../pages/Pharmacy').then(m => ({ default: m.Pharmacy })) },
        { path: '/services', component: () => import('../pages/Services').then(m => ({ default: m.Services })) },
        { path: '/reports', component: () => import('../pages/Reports').then(m => ({ default: m.Reports })) },
        { path: '/tickets', component: () => import('../pages/Tickets').then(m => ({ default: m.Tickets })) },
      ];

    case Role.RECEPTIONIST:
      return [
        ...commonRoutes,
        { path: '/patients', component: () => import('../pages/Patients').then(m => ({ default: m.Patients })) },
        { path: '/patients/:id', component: () => import('../pages/PatientDetails').then(m => ({ default: m.PatientDetails })) },
        { path: '/tickets', component: () => import('../pages/Tickets').then(m => ({ default: m.Tickets })) },
        { path: '/services', component: () => import('../pages/Services').then(m => ({ default: m.Services })) },
      ];

    default:
      return commonRoutes;
  }
};
