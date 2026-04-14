import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Eye, EyeOff, AlertCircle, Loader2, Heart, Shield, Users, Stethoscope } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isLoading, currentUser } = useStore();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    console.log('Login: tentative de connexion avec', email);

    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erreur de connexion. Veuillez réessayer.');
      alert('Erreur de connexion: ' + error.message);
    }
  };

  React.useEffect(() => {
    const savedEmail = localStorage.getItem('remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  React.useEffect(() => {
    if (!isLoading && currentUser) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex">
      {/* Sidebar gauche - Informations */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-purple-700 text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
              <img src="/LOGO.png" alt="O'CLIC SANTE" className="w-10 h-10 object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">O'CLIC SANTE</h1>
              <p className="text-blue-100 text-sm">Plateforme de gestion médicale</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-4">Bienvenue dans votre espace professionnel</h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Gérez efficacement votre centre de santé avec notre solution complète et moderne.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Gestion des Patients</h3>
                  <p className="text-blue-100">Suivi complet des dossiers médicaux</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Consultations</h3>
                  <p className="text-blue-100">Planification et suivi des rendez-vous</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Sécurité</h3>
                  <p className="text-blue-100">Protection complète des données médicales</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-blue-100 text-sm">
          <p>© 2024 O'CLIC SANTE. Tous droits réservés.</p>
        </div>
      </div>

      {/* Formulaire de connexion */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          {/* Logo mobile */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
              <img src="/LOGO.png" alt="O'CLIC SANTE" className="w-12 h-12 object-contain" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600">Accédez à votre espace de travail</p>
          </div>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur de connexion
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="admin@medina.sn"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"
                    placeholder="••••••••"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Mot de passe oublié?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>

          {/* Comptes de démonstration */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Comptes de démonstration</h3>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-blue-100">
                <span className="font-medium text-gray-700">Admin</span>
                <span className="text-gray-500">admin@medina.sn / demo123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-blue-100">
                <span className="font-medium text-gray-700">Médecin</span>
                <span className="text-gray-500">doctor@medina.sn / demo123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-blue-100">
                <span className="font-medium text-gray-700">Réception</span>
                <span className="text-gray-500">reception@medina.sn / demo123</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded-lg border border-blue-100">
                <span className="font-medium text-gray-700">Pharmacie</span>
                <span className="text-gray-500">pharmacy@medina.sn / demo123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
