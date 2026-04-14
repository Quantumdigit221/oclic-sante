import React, { useState } from 'react';
import { ArrowLeft, Activity, Brain, Scan, Camera, AlertTriangle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import MedicalImageAnalyzer from '../components/MedicalImageAnalyzer';
import { Card } from '../components/ui/Card';

interface AnalysisHistory {
  id: string;
  timestamp: Date;
  fileName: string;
  imageType?: string;
  result: any;
}

export const MedicalImageTest = () => {
  const [history, setHistory] = useState<AnalysisHistory[]>([]);

  const handleAnalysisComplete = (result: any) => {
    const newEntry: AnalysisHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      fileName: 'image_' + Date.now(),
      imageType: result.imageType,
      result
    };
    
    setHistory(prev => [newEntry, ...prev.slice(0, 4)]);
  };

  const getImageTypeIcon = (type?: string) => {
    switch (type) {
      case 'radiographie': return <Eye className="w-4 h-4" />;
      case 'irm': return <Brain className="w-4 h-4" />;
      case 'scanner': return <Scan className="w-4 h-4" />;
      case 'echographie': return <Camera className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
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
                <Activity className="w-6 h-6 text-blue-600" />
                Analyse d'Imagerie Médicale
              </h1>
              <p className="text-slate-500">
                IA pour radiographies, IRM, scanners et échographies
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              IA Médicale
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Analyzer */}
        <div className="lg:col-span-2">
          <MedicalImageAnalyzer 
            onAnalysisComplete={handleAnalysisComplete}
            title="Analyse d'Images Médicales"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supported Types */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900">Types d'images supportées</h3>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <p><strong>Radiographies</strong> - Os, thorax, dentaire</p>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <p><strong>IRM</strong> - Tissus mous, cerveau, articulations</p>
              </div>
              <div className="flex items-center gap-2">
                <Scan className="w-4 h-4 text-green-600" />
                <p><strong>Scanner</strong> - 3D, organes internes</p>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-600" />
                <p><strong>Échographies</strong> - Tissus, fœtus, cœur</p>
              </div>
            </div>
          </Card>

          {/* Features */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Capacités d'analyse</h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800">🔍 Détection automatique</p>
                <p className="text-blue-700">• Type d'image</p>
                <p className="text-blue-700">• Qualité</p>
                <p className="text-blue-700">• Résolution</p>
              </div>
              
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="font-medium text-amber-800">⚠️ Détection d'anomalies</p>
                <p className="text-amber-700">• Fractures (radios)</p>
                <p className="text-amber-700">• Lésions (IRM)</p>
                <p className="text-amber-700">• Masses (scanner)</p>
                <p className="text-amber-700">• Kystes (échographie)</p>
              </div>
            </div>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-4">Analyses récentes</h3>
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.fileName}
                      </p>
                      <span className="text-xs text-slate-500">
                        {item.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {item.imageType && (
                      <div className="flex items-center gap-2">
                        {getImageTypeIcon(item.imageType)}
                        <p className="text-xs text-blue-600 capitalize">
                          {item.imageType.replace('_', ' ')}
                        </p>
                      </div>
                    )}
                    
                    {item.result.findings?.anomalies && item.result.findings.anomalies.length > 0 && (
                      <p className="text-xs text-amber-600 mt-1">
                        {item.result.findings.anomalies.length} anomalie(s) détectée(s)
                      </p>
                    )}
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
                <span className="text-blue-600 font-bold">1.</span>
                <p>Uploadez une image médicale (radio, IRM, scanner, écho)</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <p>L'IA détecte automatiquement le type d'image</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <p>Analyse de la qualité et détection d'anomalies</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <p>Obtenez un rapport détaillé avec mesures</p>
              </div>
            </div>
          </Card>

          {/* Tech Info */}
          <Card>
            <h3 className="font-bold text-slate-900 mb-4">Technologie</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-slate-700">Analyse</p>
                <p className="text-slate-600">Canvas API + Algorithmes</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">Détection</p>
                <p className="text-slate-600">Contours + Textures + Patterns</p>
              </div>
              <div>
                <p className="font-medium text-slate-700">Support</p>
                <p className="text-slate-600">Images JPG, PNG, WebP</p>
              </div>
            </div>
          </Card>

          {/* Warning */}
          <Card className="bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900 mb-2">Important</h4>
                <p className="text-sm text-amber-800">
                  Cet outil est une <strong>assistance au diagnostic</strong> et ne remplace 
                  pas l'avis d'un professionnel de santé qualifié.
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Consultez toujours un médecin pour interprétation médicale.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="bg-blue-100 rounded-lg p-6 text-center">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            🏥 Analyse d'Imagerie Médicale par IA
          </h3>
          <p className="text-blue-800">
            Traitement local pour confidentialité maximale. 
            Support des radiographies, IRM, scanners et échographies.
          </p>
          <p className="text-sm text-blue-700 mt-2">
            ⚠️ Outil d'assistance - Ne remplace pas un avis médical professionnel
          </p>
        </div>
      </div>
    </div>
  );
};
