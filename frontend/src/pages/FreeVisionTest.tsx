import React, { useState } from 'react';
import { ArrowLeft, Settings, Info, Zap, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import FreeVisionAnalyzer from '../components/FreeVisionAnalyzer';
import { Card } from '../components/ui/Card';

interface AnalysisHistory {
  id: string;
  timestamp: Date;
  fileName: string;
  result: any;
}

export const FreeVisionTest = () => {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);

  const handleAnalysisComplete = (result: any) => {
    const newEntry: AnalysisHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      fileName: 'document_' + Date.now(),
      result
    };
    
    setHistory(prev => [newEntry, ...prev.slice(0, 4)]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-green-600" />
                Analyse GRATUITE de Documents
              </h1>
              <p className="text-slate-500">
                Solution 100% gratuite - Aucune carte de crédit requise
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-2">
              <Gift className="w-4 h-4" />
              100% GRATUIT
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analyzer */}
        <div className="lg:col-span-2">
          <FreeVisionAnalyzer 
            onAnalysisComplete={handleAnalysisComplete}
            title="Scanner de Documents Médicaux GRATUIT"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Free Features */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-slate-900">Avantages GRATUITS</h3>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p><strong>Aucune carte de crédit</strong> requis</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p><strong>Illimité</strong> - Pas de limite d'utilisation</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p><strong>OCR Tesseract.js</strong> - Précision professionnelle</p>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p><strong>Confidentiel</strong> - Vos données restent privées</p>
              </div>
            </div>
          </Card>

          {/* Comparison */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Comparaison</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-medium text-green-800">🎉 Solution GRATUITE</p>
                <p className="text-green-700">• Tesseract.js OCR</p>
                <p className="text-green-700">• Précision 95%+</p>
                <p className="text-green-700">• 100% privé</p>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-medium text-slate-800">💰 Google Vision</p>
                <p className="text-slate-700">• Très précis</p>
                <p className="text-slate-700">• $1.50/1000 docs</p>
                <p className="text-slate-700">• Carte crédit req.</p>
              </div>
            </div>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4">Analyses récentes</h3>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.fileName}
                      </p>
                      <span className="text-xs text-slate-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {item.result.success && item.result.documentType && (
                      <p className="text-xs text-green-600 font-medium">
                        {item.result.documentType}
                      </p>
                    )}
                    
                    <p className="text-xs text-green-700">
                      {item.result.provider}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Guide d'utilisation</h3>
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">1.</span>
                <p>Uploadez un document médical</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">2.</span>
                <p>Cliquez sur "Analyser GRATUITEMENT"</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">3.</span>
                <p>L'IA extrait automatiquement les informations</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600 font-bold">4.</span>
                <p>Utilisez les données comme vous voulez</p>
              </div>
            </div>
          </Card>

          {/* Tech Info */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Technologie</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-slate-700">OCR Engine</p>
                <p className="text-slate-600">Tesseract.js v5+</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">Précision</p>
                <p className="text-slate-600">95%+ (documents clairs)</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">Support</p>
                <p className="text-slate-600">Images JPG, PNG</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-green-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-green-900 mb-2">
            🎉 Solution 100% GRATUITE et Open Source
          </h3>
          <p className="text-green-800">
            Aucun coût caché, aucune limite, aucune carte de crédit requise. 
            Vos données médicales restent 100% privées et sécurisées.
          </p>
        </div>
      </div>
    </div>
  );
};
