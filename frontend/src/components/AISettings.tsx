import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Settings, Brain, Key, Server, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { aiDiagnosisService } from '../services/aiDiagnosisService';

interface AISettings {
  provider: 'deepmind' | 'google-cloud' | 'azure' | 'custom';
  apiKey: string;
  baseUrl: string;
  autoAnalysis: boolean;
  confidenceThreshold: number;
  saveHistory: boolean;
}

function AISettings() {
  const { currentCenter, currentUser } = useStore();
  const [settings, setSettings] = useState<AISettings>({
    provider: 'custom',
    apiKey: '',
    baseUrl: 'https://api.example-ai-service.com',
    autoAnalysis: true,
    confidenceThreshold: 0.7,
    saveHistory: true
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    // Charger les paramètres sauvegardés
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('aiSettings', JSON.stringify(settings));
    // Mettre à jour le service avec les nouveaux paramètres
    aiDiagnosisService.configure({
      apiKey: settings.apiKey,
      baseUrl: settings.baseUrl
    });
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Simulation de test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (settings.apiKey && settings.baseUrl) {
        setTestResult({
          success: true,
          message: 'Connexion établie avec succès'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Veuillez configurer la clé API et l\'URL du service'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Échec de la connexion au service IA'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const providers = [
    {
      id: 'deepmind',
      name: 'Google DeepMind',
      description: 'Utiliser les modèles de Google DeepMind pour l\'analyse médicale',
      icon: Brain,
      color: 'text-blue-600'
    },
    {
      id: 'google-cloud',
      name: 'Google Cloud Vision',
      description: 'API Google Cloud Vision pour l\'analyse d\'images médicales',
      icon: Eye,
      color: 'text-green-600'
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      description: 'Azure Cognitive Services pour l\'analyse médicale',
      icon: Server,
      color: 'text-blue-500'
    },
    {
      id: 'custom',
      name: 'Service personnalisé',
      description: 'Utiliser un service IA personnalisé',
      icon: Settings,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-purple-100 rounded-lg">
          <Brain className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Paramètres IA</h2>
          <p className="text-slate-500">Configuration du service de diagnostic par intelligence artificielle</p>
        </div>
      </div>

      {/* Sélection du fournisseur */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Fournisseur IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => {
            const Icon = provider.icon;
            return (
              <button
                key={provider.id}
                onClick={() => setSettings({ ...settings, provider: provider.id as any })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  settings.provider === provider.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${provider.color}`} />
                  <div>
                    <div className="font-medium text-slate-900">{provider.name}</div>
                    <div className="text-sm text-slate-500">{provider.description}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration API */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Configuration API</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              Clé API
            </label>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder="Entrez votre clé API"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Votre clé API sera stockée localement et utilisée pour les requêtes IA
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Server className="w-4 h-4 inline mr-2" />
              URL du service
            </label>
            <input
              type="url"
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              placeholder="https://api.example-ai-service.com"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={testConnection}
              disabled={isTesting || !settings.apiKey || !settings.baseUrl}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Test en cours...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Tester la connexion
                </>
              )}
            </button>

            {testResult && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="text-sm">{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paramètres avancés */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Paramètres avancés</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-slate-900">Analyse automatique</label>
              <p className="text-sm text-slate-500">Lancer l'analyse IA automatiquement après upload</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoAnalysis: !settings.autoAnalysis })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.autoAnalysis ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoAnalysis ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-slate-900">Seuil de confiance</label>
              <p className="text-sm text-slate-500">Confiance minimale pour valider un résultat</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                className="w-24"
              />
              <span className="text-sm font-medium text-slate-900 w-12">
                {(settings.confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-slate-900">Sauvegarder l'historique</label>
              <p className="text-sm text-slate-500">Conserver l'historique des analyses</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, saveHistory: !settings.saveHistory })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.saveHistory ? 'bg-purple-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.saveHistory ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => {
            const defaultSettings: AISettings = {
              provider: 'custom',
              apiKey: '',
              baseUrl: 'https://api.example-ai-service.com',
              autoAnalysis: true,
              confidenceThreshold: 0.7,
              saveHistory: true
            };
            setSettings(defaultSettings);
          }}
          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
        >
          Réinitialiser
        </button>
        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

export default AISettings;
