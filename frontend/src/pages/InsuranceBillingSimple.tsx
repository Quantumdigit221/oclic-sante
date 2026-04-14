import React, { useState } from 'react';

export const InsuranceBilling: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Facturation Assurance</h1>
      
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Transactions</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg"
          >
            + Nouvelle Transaction
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-slate-600">Aucune transaction pour le moment.</p>
            <p className="text-sm text-slate-500 mt-1">Cliquez sur "Nouvelle Transaction" pour commencer.</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Nouvelle Transaction</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                  <option>Sélectionner un patient</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compagnie</label>
                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg">
                  <option>Sélectionner une compagnie</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Montant Total (FCFA)</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-lg" placeholder="0" />
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
