import React, { useState } from 'react';

export const InsuranceReports: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Rapports Assurance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <p className="text-sm text-slate-500">Couverture</p>
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
              <p className="text-sm text-slate-500">Payées</p>
              <p className="text-2xl font-bold text-slate-900">723</p>
            </div>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compagnie</label>
            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
              <option>Toutes les compagnies</option>
              <option>CNAM</option>
              <option>AXA</option>
              <option>SANLAM</option>
              <option>NSIA</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Export des Rapports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
            <h3 className="font-medium text-slate-900 mb-1">📊 Rapport Global</h3>
            <p className="text-sm text-slate-600">Export complet de toutes les réclamations</p>
          </button>
          
          <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
            <h3 className="font-medium text-slate-900 mb-1">🏢 Par Compagnie</h3>
            <p className="text-sm text-slate-600">Rapports détaillés par compagnie</p>
          </button>
          
          <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
            <h3 className="font-medium text-slate-900 mb-1">👥 Par Patient</h3>
            <p className="text-sm text-slate-600">Historique par patient</p>
          </button>
          
          <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
            <h3 className="font-medium text-slate-900 mb-1">💰 Financier</h3>
            <p className="text-sm text-slate-600">Rapport financier détaillé</p>
          </button>
          
          <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
            <h3 className="font-medium text-slate-900 mb-1">📈 Tendances</h3>
            <p className="text-sm text-slate-600">Analyse des tendances mensuelles</p>
          </button>
          
          <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
            <h3 className="font-medium text-slate-900 mb-1">📧 Email</h3>
            <p className="text-sm text-slate-600">Envoyer par email</p>
          </button>
        </div>
      </div>
    </div>
  );
};
