import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Users, UserPlus, Edit, Trash2, Shield, Stethoscope, Pill, Calendar, Building2 } from 'lucide-react';
import { Role } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
  centerId?: string;
  specialty?: string;
  password?: string;
}

export const UserManagement = () => {
  const { currentCenter } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Vérifications de sécurité pour éviter les erreurs filter
  const usersList = Array.isArray(users) ? users : [];

  const [newUser, setNewUser] = useState<Partial<User>>({
    name: '',
    email: '',
    role: Role.RECEPTIONIST,
    phone: '',
    password: 'demo123'
  });

  // Simuler le chargement des utilisateurs du centre
  useEffect(() => {
    // En production, ceci viendrait de l'API
    const mockUsers: User[] = [
      {
        id: 'doctor-1',
        name: 'Dr. Samba Ndiaye',
        email: 'doctor1@centre.sn',
        role: Role.DOCTOR,
        phone: '22177000101',
        centerId: currentCenter?.id,
        specialty: 'Généraliste'
      },
      {
        id: 'nurse-1',
        name: 'Aminata Diop',
        email: 'nurse1@centre.sn',
        role: Role.RECEPTIONIST,
        phone: '22176000101',
        centerId: currentCenter?.id
      },
      {
        id: 'pharma-1',
        name: 'Moussa Faye',
        email: 'pharma1@centre.sn',
        role: Role.PHARMACIST,
        phone: '22178000101',
        centerId: currentCenter?.id
      }
    ];
    setUsers(mockUsers);
  }, [currentCenter]);

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Shield className="w-4 h-4 text-purple-600" />;
      case Role.DOCTOR:
        return <Stethoscope className="w-4 h-4 text-blue-600" />;
      case Role.PHARMACIST:
        return <Pill className="w-4 h-4 text-green-600" />;
      case Role.RECEPTIONIST:
        return <Calendar className="w-4 h-4 text-amber-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case Role.DOCTOR:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case Role.PHARMACIST:
        return 'bg-green-100 text-green-800 border-green-200';
      case Role.RECEPTIONIST:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDescription = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'Gestion complète du centre';
      case Role.DOCTOR:
        return 'Consultations et dossiers médicaux';
      case Role.PHARMACIST:
        return 'Gestion de la pharmacie';
      case Role.RECEPTIONIST:
        return 'Accueil et gestion des patients';
      default:
        return 'Utilisateur standard';
    }
  };

  const handleAddUser = () => {
    if (newUser.name && newUser.email && newUser.phone) {
      const userToAdd: User = {
        id: `user-${Date.now()}`,
        name: newUser.name!,
        email: newUser.email!,
        role: newUser.role as Role,
        phone: newUser.phone!,
        centerId: currentCenter?.id,
        specialty: newUser.specialty
      };
      setUsers([...users, userToAdd]);
      setNewUser({ name: '', email: '', role: Role.RECEPTIONIST, phone: '', password: 'demo123' });
      setIsAddingUser(false);
      alert('Utilisateur ajouté avec succès!');
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      setUsers(usersList.filter(u => u.id !== userId));
      alert('Utilisateur supprimé avec succès!');
    }
  };

  const getRoleStats = () => {
    const stats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<Role, number>);
    
    return [
      { role: Role.ADMIN, count: stats[Role.ADMIN] || 0, icon: Shield, color: 'purple' },
      { role: Role.DOCTOR, count: stats[Role.DOCTOR] || 0, icon: Stethoscope, color: 'blue' },
      { role: Role.PHARMACIST, count: stats[Role.PHARMACIST] || 0, icon: Pill, color: 'green' },
      { role: Role.RECEPTIONIST, count: stats[Role.RECEPTIONIST] || 0, icon: Calendar, color: 'amber' }
    ];
  };

  if (!currentCenter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Centre non trouvé</h2>
          <p className="text-gray-600">Aucun centre n'est actuellement assigné à votre compte.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            Gestion des Utilisateurs
          </h2>
          <p className="text-sm text-slate-500">{currentCenter.name} - {users.length} utilisateurs</p>
        </div>
        <button
          onClick={() => setIsAddingUser(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Statistiques des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {getRoleStats().map(({ role, count, icon: Icon, color }) => (
          <div key={role} className={`bg-${color}-50 p-4 rounded-lg border border-${color}-200`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${color}-100 rounded-lg`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              <div>
                <p className={`text-2xl font-bold text-${color}-900`}>{count}</p>
                <p className={`text-sm text-${color}-600`}>{role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formulaire d'ajout */}
      {isAddingUser && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Ajouter un utilisateur</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
              <input
                type="text"
                value={newUser.name || ''}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={newUser.email || ''}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={newUser.phone || ''}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
              <select
                value={newUser.role || Role.RECEPTIONIST}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value={Role.RECEPTIONIST}>Réceptionniste</option>
                <option value={Role.DOCTOR}>Médecin</option>
                <option value={Role.PHARMACIST}>Pharmacien</option>
                <option value={Role.ADMIN}>Administrateur</option>
              </select>
            </div>
            {newUser.role === Role.DOCTOR && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Spécialité</label>
                <input
                  type="text"
                  value={newUser.specialty || ''}
                  onChange={(e) => setNewUser({ ...newUser, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ex: Généraliste, Pédiatre..."
                />
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddUser}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Ajouter
            </button>
            <button
              onClick={() => setIsAddingUser(false)}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Liste des utilisateurs</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Rôle</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Permissions</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(user.role)}
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div>{user.phone}</div>
                    {user.specialty && <div className="text-xs text-slate-500">{user.specialty}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {getRoleDescription(user.role)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Aucun utilisateur trouvé. Ajoutez votre premier utilisateur !
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
