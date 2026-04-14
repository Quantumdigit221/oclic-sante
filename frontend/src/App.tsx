
import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useStore } from './store';
import { AuthProvider } from './components/AuthProvider';
import { Layout } from './components/Layout';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Role } from './types';

// Imports directs pour éviter les erreurs de lazy loading
import { Tickets } from './pages/Tickets';
import { Pharmacy } from './pages/Pharmacy';
import { Services } from './pages/Services';
import { Staff } from './pages/Staff';
import { Reports } from './pages/Reports';
import Consultations from './pages/Consultations';
import { Patients } from './pages/Patients';
import AISettings from './components/AISettings';
import DiagnosisAI from './pages/DiagnosisAI';
import PatientDetails from './pages/PatientDetails';
import LabResults from './pages/LabResults';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { SuperAdmin } from './pages/SuperAdmin';
import { AdminCenter } from './pages/AdminCenter';
import { RegisterCenter } from './pages/RegisterCenter';
import { VisionTest } from './pages/VisionTest';
import { FreeVisionTest } from './pages/FreeVisionTest';
import { MedicalImageTest } from './pages/MedicalImageTest';
import { Prescriptions } from './pages/Prescriptions';
import { Exams } from './pages/Exams';
import { Appointments } from './pages/Appointments';
import { InsuranceDashboard } from './pages/InsuranceDashboard';
import { InsuranceManagement } from './pages/InsuranceManagement';
import { InsuranceBilling } from './pages/InsuranceBilling';
import { InsuranceReports } from './pages/InsuranceReports';
import { PatientInsuranceManagement } from './pages/PatientInsuranceManagement';
import { InsuranceClaimsManagement } from './pages/InsuranceClaimsManagement';
import { ResourcesManagement } from './pages/ResourcesManagement';

// Nouvelles pages - Composants temporaires
const ComingSoon = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Page en construction</h2>
      <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible.</p>
    </div>
  </div>
);

const Treatments = () => <ComingSoon />;
const Hospitalizations = () => <ComingSoon />;

// Pages de la pharmacie - Utilisation des composants temporaires
const PharmacyMedicines = () => <ComingSoon />;
const PharmacySales = () => <ComingSoon />;
const PharmacyOrders = () => <ComingSoon />;
const PharmacyInventory = () => <ComingSoon />;
const PharmacyPrescriptions = () => <ComingSoon />;
const PharmacySuppliers = () => <ComingSoon />;
const PharmacySettings = () => <ComingSoon />;

const AppRoutes = () => {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <Auth />;
  }

  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      }>
        <Routes>
          {/* Tableau de bord */}
          <Route path="/" element={<Dashboard />} />

          {/* Gestion des patients */}
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients/new" element={<PatientDetails />} />
          <Route path="/patients/:id" element={<PatientDetails />} />
          <Route path="/patients/:id/lab-results" element={<LabResults />} />

          {/* Services médicaux */}
          <Route path="/consultations" element={<Consultations />} />
          <Route path="/diagnosis-ai" element={<DiagnosisAI />} />
          <Route path="/ai-settings" element={<AISettings />} />
          <Route path="/vision-test" element={<VisionTest />} />
          <Route path="/free-vision-test" element={<FreeVisionTest />} />
          <Route path="/medical-image-test" element={<MedicalImageTest />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/treatments" element={<Treatments />} />
          <Route path="/hospitalizations" element={<Hospitalizations />} />

          {/* Assurances & IPM */}
          <Route path="/insurance/dashboard" element={<InsuranceDashboard />} />
          <Route path="/insurance/management" element={<InsuranceManagement />} />
          <Route path="/insurance/billing" element={<InsuranceBilling />} />
          <Route path="/insurance/reports" element={<InsuranceReports />} />
          <Route path="/insurance/patients" element={<PatientInsuranceManagement />} />
          <Route path="/insurance/claims" element={<InsuranceClaimsManagement />} />

          {/* Pharmacie */}
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/pharmacy/medicines" element={<PharmacyMedicines />} />
          <Route path="/pharmacy/sales" element={<PharmacySales />} />
          <Route path="/pharmacy/orders" element={<PharmacyOrders />} />
          <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
          <Route path="/pharmacy/prescriptions" element={<PharmacyPrescriptions />} />
          <Route path="/pharmacy/suppliers" element={<PharmacySuppliers />} />
          <Route path="/pharmacy/settings" element={<PharmacySettings />} />

          {/* Ressources & Finance */}
          <Route path="/resources" element={<ResourcesManagement />} />

          {/* Administration */}
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/services" element={<Services />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/reports" element={<Reports />} />

          {/* Compte */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Admin */}
          <Route path="/admin/center" element={<AdminCenter />} />
          
          {/* Super Admin */}
          {currentUser.role === Role.SUPER_ADMIN && (
            <Route path="/admin/centers" element={<SuperAdmin />} />
          )}

          {/* Inscription centre */}
          <Route path="/register-center" element={<RegisterCenter />} />

          {/* Route par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
