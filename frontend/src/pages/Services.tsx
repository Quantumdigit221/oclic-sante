
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, Trash2, Search, Activity, Clock, Edit } from 'lucide-react';
import { Service, Role } from '../types';

export const Services = () => {
  const { services, addService, updateService, deleteService, refreshTickets, currentUser } = useStore();
  
  // Vérifications de sécurité pour éviter les erreurs filter
  const servicesList = Array.isArray(services) ? services : [];
  
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    category: 'Consultation',
    price: 0,
    emergencyPrice: 0,
    durationMinutes: 15,
    description: '',
    isActive: true
  });

  const categories = ['Consultation', 'Maternité', 'Soins', 'Laboratoire', 'Imagerie', 'Hospitalisation', 'Urgences'];

  const isAdmin = currentUser && [Role.ADMIN, Role.SUPER_ADMIN].includes((currentUser.role || '').toUpperCase() as Role);

  const handleOpenModal = (service?: Service) => {
    if (!isAdmin) return;
    if (service) {
      setEditingId(service.id);
      setFormData({
        name: service.name,
        category: service.category,
        price: service.price,
        emergencyPrice: service.emergencyPrice,
        durationMinutes: service.durationMinutes,
        description: service.description,
        isActive: service.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: 'Consultation',
        price: 0,
        emergencyPrice: 0,
        durationMinutes: 15,
        description: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    if (formData.name && formData.price !== undefined) {
      if (editingId) {
        updateService(editingId, formData);
      } else {
        addService({
          name: formData.name,
          category: formData.category || 'Consultation',
          price: Number(formData.price),
          emergencyPrice: Number(formData.emergencyPrice || 0),
          durationMinutes: Number(formData.durationMinutes || 15),
          description: formData.description || '',
          isActive: true
        });
      }
      setShowModal(false);
    }
  };

  const filteredServices = servicesList.filter(s =>
    (s.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Services</h2>
          <p className="text-sm text-slate-500">Tarifs et prestations médicales</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={refreshTickets}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
                title="Rafraîchir la liste"
              >
                <Activity className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="bg-teal-400 text-slate-900 px-4 py-2 rounded-lg hover:bg-teal-500 font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Service
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un service..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Service</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Catégorie</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Prix Standard</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Prix Urgence</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Durée Est.</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredServices.map((service, index) => (
                <tr key={service.id || `service-${index}`} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{service.name}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{service.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{service.price} FCFA</td>
                  <td className="px-6 py-4 text-red-600">{service.emergencyPrice} FCFA</td>
                  <td className="px-6 py-4 text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {service.durationMinutes} min
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <React.Fragment>
                          <button
                            onClick={() => handleOpenModal(service)}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Voulez-vous vraiment supprimer le service "${service.name}" ?`)) {
                                deleteService(service.id);
                              }
                            }}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </React.Fragment>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr key="empty-services">
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    Aucun service trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                {editingId ? 'Modifier Service' : 'Ajouter un Service'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <Activity className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Service</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Consultation Générale"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Durée (min)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.durationMinutes}
                    onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix Standard (FCFA)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix Urgence (FCFA)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.emergencyPrice}
                    onChange={e => setFormData({ ...formData, emergencyPrice: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détails sur la prestation..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-400 text-slate-900 rounded-lg hover:bg-teal-500 font-medium shadow-sm"
                >
                  {editingId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
