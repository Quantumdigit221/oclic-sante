import React, { useState } from 'react';
import { useStore } from '../store';
import { Building2, MapPin, Phone, Mail, Edit, Save, X, Users, Calendar, FileText, Pill } from 'lucide-react';
import { HealthCenter } from '../types';

export const AdminCenter = () => {
  const { currentCenter, updateCenter } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<HealthCenter>>({});

  if (!currentCenter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Aucun centre assigné</h2>
          <p className="text-gray-600">Aucun centre n'est actuellement assigné à votre compte.</p>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setEditForm({
      name: currentCenter.name,
      address: currentCenter.address,
      phone: currentCenter.phone,
      email: currentCenter.email,
      directorName: currentCenter.directorName,
      rnis: currentCenter.rnis,
      capacity: currentCenter.capacity,
      pispiAlias: currentCenter.pispiAlias
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const centerToUpdate = { ...editForm, id: currentCenter.id };
      await updateCenter(centerToUpdate);
      setIsEditing(false);
      alert('Centre mis à jour avec succès!');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('Erreur lors de la mise à jour du centre');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-black">🏥 TABLEAU DE BORD ADMIN CENTRE</h2>
              <p className="text-orange-100 mt-2">Gestion individuelle du centre de santé</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/20 rounded-full">
                <span className="text-orange-100 font-black text-sm font-bold">ADMIN</span>
              </div>
              <div className={`w-4 h-4 rounded-full ${currentCenter?.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg border-l-4 border-orange-500 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <Building2 className="w-6 h-6" />
                Informations du Centre
              </h3>
            </div>
            <div className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom du centre</label>
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                    <input
                      type="text"
                      value={editForm.address || ''}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{currentCenter.name}</h4>
                      <p className="text-sm text-slate-500">ID: {currentCenter.id}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      {currentCenter.address}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      {currentCenter.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      {currentCenter.email}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-center">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Modifier le centre
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
