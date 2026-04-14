import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Building2, Mail, Lock, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export function Auth() {
  const { login, isLoading, currentUser } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@sante-saas.sn');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const success = await login(email, password);
      if (success) {
        setSuccess('Connexion réussie!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    }
  };

  const fillDemo = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('demo123');
    setError('');
    setSuccess('');
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-600 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-lg font-medium text-slate-700">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-600 to-blue-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Santé SaaS</h1>
          <p className="text-slate-600">Connexion à votre centre de santé</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@medina.sn"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                placeholder="demo123"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400 mb-3 font-medium uppercase tracking-wider">
            Comptes de démonstration
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@sante-saas.sn')}
              className="text-xs px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@centre1.sn')}
              className="text-xs px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Admin Centre
            </button>
            <button
              type="button"
              onClick={() => fillDemo('doctor1@centre1.sn')}
              className="text-xs px-3 py-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Médecin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('pharma1@centre1.sn')}
              className="text-xs px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Pharmacie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
