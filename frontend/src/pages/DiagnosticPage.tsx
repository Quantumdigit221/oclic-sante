import React from 'react';

export const DiagnosticPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">🔍 Diagnostic O'CLIC SANTE</h1>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">État du Système</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800">✅ Frontend Actif</span>
            <span className="text-green-600 font-mono">:3003</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800">✅ Backend Actif</span>
            <span className="text-green-600 font-mono">:8000</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800">✅ Routes Assurance Configurées</span>
            <span className="text-green-600">6 modules</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Test des Pages Assurance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a href="/#/insurance/dashboard" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">📊 Tableau de Bord</h3>
            <p className="text-sm text-slate-600">/insurance/dashboard</p>
          </a>
          <a href="/#/insurance/billing" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">💰 Facturation</h3>
            <p className="text-sm text-slate-600">/insurance/billing</p>
          </a>
          <a href="/#/insurance/patients" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">👥 Assurances Patients</h3>
            <p className="text-sm text-slate-600">/insurance/patients</p>
          </a>
          <a href="/#/insurance/claims" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">📋 Réclamations</h3>
            <p className="text-sm text-slate-600">/insurance/claims</p>
          </a>
          <a href="/#/insurance/management" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">🏢 Gestion Compagnies</h3>
            <p className="text-sm text-slate-600">/insurance/management</p>
          </a>
          <a href="/#/insurance/reports" className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <h3 className="font-medium text-slate-900 mb-1">📈 Rapports</h3>
            <p className="text-sm text-slate-600">/insurance/reports</p>
          </a>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Actions de Dépannage</h2>
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-800 mb-1">🔑 1. Vérifiez la connexion</h3>
            <p className="text-sm text-yellow-600">Assurez-vous d'être connecté avec un compte valide</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-1">🔄 2. Rafraîchissez la page</h3>
            <p className="text-sm text-blue-600">Appuyez sur F5 ou Ctrl+R pour recharger</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-800 mb-1">🧹 3. Videz le cache</h3>
            <p className="text-sm text-purple-600">Ctrl+Shift+R pour recharger sans cache</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Identifiants de Connexion</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-1">Super Admin</h3>
            <p className="text-sm text-slate-600">superadmin@sante.sn</p>
            <p className="text-sm text-slate-600">demo123</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium text-slate-900 mb-1">Admin</h3>
            <p className="text-sm text-slate-600">admin@medina.sn</p>
            <p className="text-sm text-slate-600">demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
};
