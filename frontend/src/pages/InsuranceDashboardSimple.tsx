import React from 'react';

export const InsuranceDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Tableau de Bord Assurance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Réclamations</p>
              <p className="text-2xl font-bold text-slate-900">1,247</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              📋
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Montant Total</p>
              <p className="text-2xl font-bold text-slate-900">45.7M FCFA</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              💰
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Couverture Moyenne</p>
              <p className="text-2xl font-bold text-slate-900">80%</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              🛡️
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Temps Moyen</p>
              <p className="text-2xl font-bold text-slate-900">4.2 jours</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              ⏱️
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Accès Rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a href="/#/insurance/billing" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">💰 Facturation</h3>
            <p className="text-sm text-slate-600">Créer des transactions d'assurance</p>
          </a>
          
          <a href="/#/insurance/patients" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">👥 Assurances Patients</h3>
            <p className="text-sm text-slate-600">Gérer les couvertures des patients</p>
          </a>
          
          <a href="/#/insurance/claims" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">📋 Réclamations</h3>
            <p className="text-sm text-slate-600">Suivre les réclamations</p>
          </a>
          
          <a href="/#/insurance/management" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">🏢 Compagnies</h3>
            <p className="text-sm text-slate-600">Gérer les compagnies d'assurance</p>
          </a>
          
          <a href="/#/insurance/reports" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">📊 Rapports</h3>
            <p className="text-sm text-slate-600">Exporter des rapports détaillés</p>
          </a>
          
          <a href="/#/test-insurance" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">🔧 Test</h3>
            <p className="text-sm text-slate-600">Page de test du module</p>
          </a>
        </div>
      </div>
    </div>
  );
};
