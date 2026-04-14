import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useAuth } from '../components/AuthProvider';
import { Building2, Search, MapPin, Phone, Mail, CheckCircle, XCircle, ShieldCheck, AlertCircle, Plus, LogIn, Users, Trash2, Edit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { HealthCenter, User, Role } from '../types';

export const SuperAdmin = () => {
  const { allCenters, toggleCenterStatus, switchCenter, users, deleteUser } = useStore();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'centers' | 'users'>('centers');

  // Vérifications de sécurité pour éviter les erreurs filter
  const allCentersList = Array.isArray(allCenters) ? allCenters : [];
  const usersList = Array.isArray(users) ? users : [];

  // Fonction pour rafraîchir les centres
  const refreshCenters = () => {
    // Simple solution: recharger la page
    window.location.reload();
  };

  const filteredCenters = allCentersList.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.directorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = allCentersList.filter(c => c.isActive).length;
  const pendingCount = allCentersList.filter(c => !c.isActive).length;

  const handleConnectToCenter = async (center: HealthCenter) => {
    try {
      console.log('Connexion au centre:', center.name);
      switchCenter(center);
      alert(`Connecté au centre: ${center.name}\n\nVous pouvez maintenant gérer ce centre.`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la connexion au centre:', error);
      alert('Erreur lors de la connexion au centre');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            Administration Globale
          </h2>
          <p className="text-sm text-slate-500">Plateforme O'CLIC SANTE - Gestion Globale</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshCenters}
            className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm transition-colors font-medium"
            title="Rafraîchir la liste"
          >
            <AlertCircle className="w-4 h-4" />
            Rafraîchir
          </button>
          <Link to="/staff">
            <button className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg border border-slate-200 flex items-center gap-2 shadow-sm transition-colors font-medium">
              <Plus className="w-4 h-4" />
              Nouveau Super Admin
            </button>
          </Link>
          <Link to="/register-center">
            <button className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium">
              <Plus className="w-4 h-4" />
              Nouveau Centre
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Centres</p>
            <h3 className="text-2xl font-bold text-slate-900">{allCenters.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-100 rounded-lg text-teal-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Utilisateurs</p>
            <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Centres Actifs</p>
            <h3 className="text-2xl font-bold text-slate-900">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Attente / Suspendus</p>
            <h3 className="text-2xl font-bold text-slate-900">{pendingCount}</h3>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('centers')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'centers' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Centres de Santé
          {activeTab === 'centers' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'users' ? 'text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Utilisateurs Globaux
          {activeTab === 'users' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600" />}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={`Rechercher un ${activeTab === 'centers' ? 'centre' : 'utilisateur'}...`}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'centers' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Centre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Directeur</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Coordonnées</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCenters.map((center) => (
                  <tr key={center.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{center.name}</div>
                          <div className="text-xs text-slate-500">RNIS: {center.rnis || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{center.directorName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-slate-500 gap-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {center.phone}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {center.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${center.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                        {center.isActive ? 'Actif' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        {center.isActive && (
                          <button
                            onClick={() => handleConnectToCenter(center)}
                            className="text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg text-xs font-bold border border-teal-200 transition-colors flex items-center gap-1"
                          >
                            <LogIn className="w-3" /> Accéder
                          </button>
                        )}
                        <button
                          onClick={() => toggleCenterStatus(center.id, !center.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${center.isActive
                            ? 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border-red-200'
                            : 'text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                            }`}
                        >
                          {center.isActive ? 'Suspendre' : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Rôle</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Centre</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
                          {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <Users className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                        ${user.role === Role.SUPER_ADMIN ? 'bg-indigo-100 text-indigo-700' :
                          user.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' :
                            user.role === Role.DOCTOR ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                        }
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {allCenters.find(c => c.id === user.centerId)?.name || 'Global'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => {
                            if (window.confirm(`Voulez-vous vraiment supprimer ${user.name} ?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
