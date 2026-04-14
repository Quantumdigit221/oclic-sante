import React, { useState } from 'react';
import { ArrowLeft, Settings, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import VisionAnalyzer from '../components/VisionAnalyzer';
import { Card } from '../components/ui/Card';

interface AnalysisHistory {
  id: string;
  timestamp: Date;
  fileName: string;
  result: any;
}

export const VisionTest = () => {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);

  const handleAnalysisComplete = (result: any) => {
    const newEntry: AnalysisHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      fileName: 'document_' + Date.now(),
      result
    };
    
    setHistory(prev => [newEntry, ...prev.slice(0, 4)]); // Garder seulement les 5 derniers
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Test Google Vision API
              </h1>
              <p className="text-slate-500">
                Analyse intelligente de documents médicaux
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analyzer */}
        <div className="lg:col-span-2">
          <VisionAnalyzer 
            onAnalysisComplete={handleAnalysisComplete}
            title="Analyse de Document Médical"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructions */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-900">Guide d'utilisation</h3>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">1.</span>
                <p>Configurez votre clé API Google Cloud Vision</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">2.</span>
                <p>Uploadez un document (ordonnance, résultat, analyse)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">3.</span>
                <p>L'IA analyse et extrait automatiquement les informations</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-teal-600 font-bold">4.</span>
                <p>Vérifiez et utilisez les données extraites</p>
              </div>
            </div>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4">Analyses récentes</h3>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.fileName}
                      </p>
                      <span className="text-xs text-slate-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {item.result.success && item.result.documentType && (
                      <p className="text-xs text-teal-600 font-medium">
                        {item.result.documentType}
                      </p>
                    )}
                    
                    {item.result.text && (
                      <p className="text-xs text-slate-600 truncate">
                        {item.result.text.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* API Info */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Configuration API</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-slate-700">Endpoint</p>
                <p className="text-slate-600 font-mono text-xs break-all">
                  https://vision.googleapis.com/v1/
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-700">Fonctionnalités</p>
                <ul className="text-slate-600 space-y-1">
                  <li>• OCR (Reconnaissance de texte)</li>
                  <li>• Détection de documents médicaux</li>
                  <li>• Extraction de données structurées</li>
                  <li>• Support français/anglais</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
