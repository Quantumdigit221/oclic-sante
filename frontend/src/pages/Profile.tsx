import React, { useState } from 'react';
import { useStore } from '../store';
import { User, Lock, Mail, Phone, Stethoscope, Building2, Save, Eye, EyeOff } from 'lucide-react';

export const Profile: React.FC = () => {
  const { currentUser, updateUser } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    specialty: currentUser?.specialty || ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!currentUser) return;
      
      const updatedUser = await updateUser(currentUser.id, formData);
      if (updatedUser) {
        setMessage('Profil mis à jour avec succès!');
        setMessageType('success');
        setIsEditing(false);
      } else {
        setMessage('Erreur lors de la mise à jour du profil');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Erreur lors de la mise à jour du profil');
      setMessageType('error');
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setMessage('Les mots de passe ne correspondent pas');
        setMessageType('error');
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setMessage('Le mot de passe doit contenir au moins 6 caractères');
        setMessageType('error');
        return;
      }
      
      // Simulation de changement de mot de passe
      // Dans une vraie application, vous appelleriez une API
      setMessage('Mot de passe changé avec succès!');
      setMessageType('success');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage('Erreur lors du changement de mot de passe');
      setMessageType('error');
    }
    
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      specialty: currentUser?.specialty || ''
    });
    setIsEditing(false);
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
          <p className="text-slate-500 mt-1">Gérez vos informations personnelles</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 mx-6 mt-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Content */}
        <div className="p-6">
          {/* Avatar et infos principales */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{currentUser.name}</h2>
              <p className="text-slate-500">{currentUser.role}</p>
              <p className="text-sm text-slate-400">{currentUser.email}</p>
            </div>
          </div>

          {/* Formulaire de profil */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              {/* Spécialité (pour médecins) */}
              {(currentUser.role === 'DOCTOR' || currentUser.role === 'ADMIN') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Spécialité
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Ex: Généraliste, Pédiatre..."
                      className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action pour le profil */}
            <div className="flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Modifier le profil
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Annuler
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Séparateur */}
          <div className="border-t border-slate-200 my-8"></div>

          {/* Changement de mot de passe */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Sécurité</h3>
            
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Changer le mot de passe
              </button>
            ) : (
              <div className="space-y-4 max-w-md">
                {/* Mot de passe actuel */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nouveau mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmation mot de passe */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Boutons d'action pour le mot de passe */}
                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Changer le mot de passe
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
