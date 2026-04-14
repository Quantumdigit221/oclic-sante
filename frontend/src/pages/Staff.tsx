
import React, { useState } from 'react';
import { useStore } from '../store';
import { Plus, User, Shield, Mail, Edit, Trash2 } from 'lucide-react';
import { Role, User as UserType } from '../types';

// Interface pour l'état du formulaire, incluant la confirmation du mot de passe
interface FormData extends Partial<UserType> {
  passwordConfirm?: string;
}

export const Staff = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: Role.RECEPTIONIST,
    specialty: '',
    phone: '',
    password: '',
    passwordConfirm: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des mots de passe
    if (editingUser) {
      // En mode édition: valider seulement si un nouveau mot de passe est fourni
      if (formData.password || formData.passwordConfirm) {
        if (formData.password !== formData.passwordConfirm) {
          alert('Les mots de passe ne correspondent pas.');
          return;
        }
        if (formData.password && formData.password.length < 6) {
          alert('Le mot de passe doit contenir au moins 6 caractères.');
          return;
        }
      }
    } else {
      // En mode création: le mot de passe est obligatoire
      if (!formData.password || !formData.passwordConfirm) {
        alert('Le mot de passe est obligatoire.');
        return;
      }
      if (formData.password !== formData.passwordConfirm) {
        alert('Les mots de passe ne correspondent pas.');
        return;
      }
      if (formData.password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
    }
    
    if (formData.name && formData.email && formData.role) {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        specialty: formData.role === Role.DOCTOR ? formData.specialty : undefined,
        phone: formData.phone
      };
      
      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password) {
        userData.password = formData.password;
      }
      
      if (editingUser) {
        updateUser(editingUser.id, userData);
      } else {
        addUser(userData);
      }
      setShowModal(false);
      setFormData({ name: '', email: '', role: Role.RECEPTIONIST, specialty: '', phone: '', password: '', passwordConfirm: '' });
      setEditingUser(null);
    }
  };

  if (!currentUser || ![Role.ADMIN, Role.SUPER_ADMIN].includes(currentUser.role.toUpperCase() as Role)) {
    return (
      <div className="p-8 text-center text-red-500">
        Accès refusé. Vous n'avez pas les permissions nécessaires pour voir cette page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion du Personnel</h2>
          <p className="text-sm text-slate-500">Comptes utilisateurs et accès</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Nouveau Membre
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div 
            key={user.id} 
            className={`relative bg-white rounded-xl shadow-sm border p-6 flex items-start gap-4 cursor-pointer transition-all ${selectedUser?.id === user.id ? 'border-teal-500 ring-2 ring-teal-200' : 'border-slate-200 hover:border-slate-300'}`}
            onClick={() => setSelectedUser(user)}
          >
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
               ) : (
                 <User className="w-6 h-6 text-slate-400" />
               )}
            </div>
            <div className="flex-1 min-w-0">
              {selectedUser?.id === user.id && (
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={() => {
                  setEditingUser(user);
                  setFormData(user);
                  setShowModal(true);
                }} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => {
                  if (window.confirm(`Voulez-vous vraiment supprimer ${user.name} ?`)) {
                    deleteUser(user.id);
                  }
                }} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              )}
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-900 truncate">{user.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide
                  ${user.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' :
                    user.role === Role.DOCTOR ? 'bg-blue-100 text-blue-700' :
                    user.role === Role.PHARMACIST ? 'bg-emerald-100 text-emerald-700' :
                    'bg-amber-100 text-amber-700'
                  }
                `}>
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-2">{user.specialty || user.role}</p>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3 h-3" /> {user.email}
                </div>
                 {user.phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3 h-3" /> {user.phone}
                  </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">{editingUser ? 'Modifier le Membre' : 'Ajouter un Membre'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <User className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
                <input 
                  type="text"
                  required 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Identifiant)</label>
                <input 
                  type="email"
                  required 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
                   <select 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as Role})}
                   >
                     {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                </div>
                {formData.role === Role.DOCTOR && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Spécialité</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      value={formData.specialty}
                      onChange={e => setFormData({...formData, specialty: e.target.value})}
                      placeholder="Ex: Pédiatre"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone (Optionnel)</label>
                <input 
                  type="tel"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                </label>
                <input 
                  type="password"
                  required={!editingUser}
                  minLength={6}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={editingUser ? "Laisser vide inchangé" : "Min. 6 caractères"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmer le mot de passe {editingUser ? '(si modifié)' : '*'}
                </label>
                <input 
                  type="password"
                  required={!editingUser}
                  minLength={6}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                  value={formData.passwordConfirm}
                  onChange={e => setFormData({...formData, passwordConfirm: e.target.value})}
                  placeholder={editingUser ? "Confirmer si modifié" : "Confirmer le mot de passe"}
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
                  {editingUser ? 'Enregistrer les Modifications' : 'Créer Compte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
