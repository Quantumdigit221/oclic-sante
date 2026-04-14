import React, { useState } from 'react';

export const InsuranceManagement: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Gestion des Compagnies d'Assurance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Compagnies</p>
              <p className="text-2xl font-bold text-slate-900">4</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              🏢
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Actives</p>
              <p className="text-2xl font-bold text-slate-900">4</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              ✅
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Types</p>
              <p className="text-2xl font-bold text-slate-900">3</p>
            </div>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              🏷️
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Liste des Compagnies</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg"
          >
            + Nouvelle Compagnie
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-slate-600">Aucune compagnie enregistrée.</p>
            <p className="text-sm text-slate-500 mt-1">Cliquez sur "Nouvelle Compagnie" pour commencer.</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Nouvelle Compagnie d'Assurance</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la Compagnie</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="CNAM" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="CNAM001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                    <option>IMP</option>
                    <option>ASSURANCE</option>
                    <option>AUTRE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="+221 33 800 00 00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="contact@cnam.sn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Personne de Contact</label>
                  <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="Dr. Diop" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">% Couverture par défaut</label>
                  <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="80" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plafond par défaut (FCFA)</label>
                  <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="500000" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <textarea className="w-full px-3 py-2 border border-slate-200 rounded-lg" rows={2} placeholder="Dakar, Plateau"></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-slate-900 rounded-lg"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
