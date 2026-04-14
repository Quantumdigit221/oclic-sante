import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export const RegisterCenter = () => {
  const navigate = useNavigate();
  const { createCenter } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    directorName: '',
    rnis: '',
    capacity: '',
    pispiAlias: '',
    adminEmail: '',
    adminPassword: '',
    adminPasswordConfirm: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation des mots de passe
    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }

    if (formData.adminPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setIsLoading(false);
      return;
    }

    try {
      await createCenter({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        directorName: formData.directorName,
        rnis: formData.rnis,
        capacity: parseInt(formData.capacity) || 20,
        pispiAlias: formData.pispiAlias,
        adminEmail: formData.adminEmail || formData.email,
        adminPassword: formData.adminPassword
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError('Erreur lors de l’inscription. Vérifiez les informations.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Centre inscrit avec succès !</h2>
          <p className="text-slate-600">Le centre a été créé et l'administrateur peut maintenant se connecter avec le mot de passe défini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Inscrire votre Centre de Santé</h1>
            <p className="text-slate-600">Créez votre compte pour commencer à utiliser la plateforme Sénégal Santé SaaS</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom du centre *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Poste de Santé Médina"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Adresse *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rue 15 x 16, Médina, Dakar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+221 33 822 00 00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contact@medina.sn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nom du directeur *</label>
                <input
                  type="text"
                  name="directorName"
                  value={formData.directorName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. Aminata Diop"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">RNIS</label>
                <input
                  type="text"
                  name="rnis"
                  value={formData.rnis}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="DK-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Capacité (patients)</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alias PISPI</label>
                <input
                  type="text"
                  name="pispiAlias"
                  value={formData.pispiAlias}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="POSTE_MEDINA_01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email administrateur *</label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@centre.sn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mot de passe administrateur *</label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Définir le mot de passe (min. 6 caractères)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirmer le mot de passe *</label>
                <input
                  type="password"
                  name="adminPasswordConfirm"
                  value={formData.adminPasswordConfirm}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Inscription...' : 'Inscrire le centre'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
