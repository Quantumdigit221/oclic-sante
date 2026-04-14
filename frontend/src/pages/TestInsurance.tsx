import React from 'react';

export const TestInsurance: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Test Module Assurance</h1>
      <div className="mt-4 space-y-2">
        <p>✅ Page de test accessible</p>
        <p>🔍 Vérification des routes d'assurance...</p>
        <div className="mt-4 p-4 bg-slate-100 rounded-lg">
          <h2 className="font-semibold mb-2">Liens de test :</h2>
          <ul className="space-y-1">
            <li><a href="/#/insurance/dashboard" className="text-blue-600 hover:underline">Tableau de Bord</a></li>
            <li><a href="/#/insurance/billing" className="text-blue-600 hover:underline">Facturation</a></li>
            <li><a href="/#/insurance/patients" className="text-blue-600 hover:underline">Assurances Patients</a></li>
            <li><a href="/#/insurance/claims" className="text-blue-600 hover:underline">Réclamations</a></li>
            <li><a href="/#/insurance/management" className="text-blue-600 hover:underline">Gestion Compagnies</a></li>
            <li><a href="/#/insurance/reports" className="text-blue-600 hover:underline">Rapports</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};
