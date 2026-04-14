import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, AlertCircle, CheckCircle, Loader2, Eye, Download, Activity, Zap, Brain, Scan } from 'lucide-react';
import MedicalImageService from '../services/medicalImageService';

interface ImageAnalysisResult {
  success: boolean;
  imageType?: 'radiographie' | 'irm' | 'scanner' | 'echographie' | 'autre';
  findings?: {
    anomalies?: string[];
    regions?: Array<{
      type: string;
      confidence: number;
      description: string;
    }>;
    measurements?: Array<{
      type: string;
      value: number;
      unit: string;
    }>;
  };
  quality?: {
    resolution: string;
    contrast: number;
    noise: number;
    sharpness: number;
  };
  metadata?: {
    dimensions: { width: number; height: number };
    format: string;
    size: string;
  };
  error?: string;
  provider: 'Canvas Analysis' | 'WebGL Processing';
}

export const MedicalImageAnalyzer: React.FC<{
  onAnalysisComplete?: (result: ImageAnalysisResult) => void;
  title?: string;
  acceptTypes?: string;
}> = ({ 
  onAnalysisComplete, 
  title = "Analyse d'Imagerie Médicale",
  acceptTypes = "image/*"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const medicalImageService = MedicalImageService.getInstance();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Créer un aperçu
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
      
      setResult(null);
    }
  };

  const analyzeMedicalImage = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setResult(null);

    try {
      // Convertir le fichier en base64
      const base64 = await MedicalImageService.fileToBase64(selectedFile);
      
      // Analyser avec le service d'imagerie médicale
      const analysisResult = await medicalImageService.analyzeMedicalImage(base64);
      
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
      
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'analyse',
        provider: 'Canvas Analysis'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getImageTypeIcon = (type?: string) => {
    switch (type) {
      case 'radiographie': return <Eye className="w-6 h-6" />;
      case 'irm': return <Brain className="w-6 h-6" />;
      case 'scanner': return <Scan className="w-6 h-6" />;
      case 'echographie': return <Activity className="w-6 h-6" />;
      default: return <Eye className="w-6 h-6" />;
    }
  };

  const getImageTypeColor = (type?: string) => {
    switch (type) {
      case 'radiographie': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'irm': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'scanner': return 'text-green-600 bg-green-50 border-green-200';
      case 'echographie': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getQualityColor = (value: number, type: string) => {
    if (type === 'noise') {
      // Moins de bruit = meilleur
      if (value < 10) return 'text-green-600';
      if (value < 20) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      // Plus de contraste/netteté = meilleur
      if (value > 150) return 'text-green-600';
      if (value > 100) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Analyse d'images médicales (radiographies, IRM, scanners, échographies)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            IA Médicale
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            HORS LIGNE
          </span>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          {preview ? (
            <div className="space-y-4">
              <img src={preview} alt="Aperçu médical" className="max-h-64 mx-auto rounded-lg shadow-sm" />
              <p className="text-sm text-blue-600 font-medium">{selectedFile?.name}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <Upload className="w-12 h-12 text-blue-400" />
              <div>
                <p className="text-lg font-medium text-slate-700">
                  Cliquez pour uploader une image médicale
                </p>
                <p className="text-sm text-slate-500">
                  Radiographies, IRM, scanners, échographies (JPG, PNG)
                </p>
              </div>
            </div>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Action Button */}
      {selectedFile && (
        <div className="mb-6">
          <button
            onClick={analyzeMedicalImage}
            disabled={analyzing}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyse médicale en cours...
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                Analyser l'image médicale
              </>
            )}
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.success ? (
            <>
              {/* Image Type Detection */}
              {result.imageType && (
                <div className={`p-4 rounded-lg border ${getImageTypeColor(result.imageType)}`}>
                  <div className="flex items-center gap-3">
                    {getImageTypeIcon(result.imageType)}
                    <div>
                      <p className="font-medium text-slate-900">
                        Type d'image détecté
                      </p>
                      <p className="text-sm font-medium capitalize">
                        {result.imageType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quality Analysis */}
              {result.quality && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-3">Qualité de l'image</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Résolution</p>
                      <p className="font-medium text-slate-900">{result.quality.resolution}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Contraste</p>
                      <p className={`font-medium ${getQualityColor(result.quality.contrast, 'contrast')}`}>
                        {result.quality.contrast}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Bruit</p>
                      <p className={`font-medium ${getQualityColor(result.quality.noise, 'noise')}`}>
                        {result.quality.noise}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Netteté</p>
                      <p className={`font-medium ${getQualityColor(result.quality.sharpness, 'sharpness')}`}>
                        {result.quality.sharpness}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Findings */}
              {result.findings && (
                <div className="space-y-3">
                  {/* Anomalies */}
                  {result.findings.anomalies && result.findings.anomalies.length > 0 && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Anomalies détectées
                      </h4>
                      <ul className="space-y-1">
                        {result.findings.anomalies.map((anomaly, index) => (
                          <li key={index} className="text-amber-800 text-sm">• {anomaly}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Regions */}
                  {result.findings.regions && result.findings.regions.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Régions d'intérêt</h4>
                      <div className="space-y-2">
                        {result.findings.regions.map((region, index) => (
                          <div key={index} className="bg-white p-3 rounded border border-blue-100">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-blue-800">
                                {region.type.replace('_', ' ').toUpperCase()}
                              </p>
                              <span className="text-sm text-blue-600">
                                {Math.round(region.confidence * 100)}% confiance
                              </span>
                            </div>
                            <p className="text-sm text-blue-700">{region.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Measurements */}
                  {result.findings.measurements && result.findings.measurements.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Mesures</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {result.findings.measurements.map((measurement, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-sm text-green-700 capitalize">
                              {measurement.type.replace('_', ' ')}:
                            </span>
                            <span className="text-sm font-medium text-green-900">
                              {measurement.value} {measurement.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              {result.metadata && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Métadonnées</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Dimensions</p>
                      <p className="font-medium text-slate-900">
                        {result.metadata.dimensions.width} × {result.metadata.dimensions.height}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600">Format</p>
                      <p className="font-medium text-slate-900">{result.metadata.format}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Taille</p>
                      <p className="font-medium text-slate-900">{result.metadata.size}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Provider Info */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Analyse réussie avec {result.provider}
                  </p>
                  <p className="text-green-700 text-sm">
                    Traitement local - Confidentialité préservée
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Erreur lors de l'analyse</p>
                <p className="text-red-700 text-sm">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-blue-100 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          <strong>🏥 Analyse d'imagerie médicale</strong> - 
          Détection automatique de radiographies, IRM, scanners et échographies. 
          Traitement local pour confidentialité maximale.
        </p>
        <p className="text-xs text-blue-700 text-center mt-2">
          ⚠️ Cet outil est une assistance et ne remplace pas l'avis d'un professionnel de santé qualifié.
        </p>
      </div>
    </div>
  );
};

export default MedicalImageAnalyzer;
