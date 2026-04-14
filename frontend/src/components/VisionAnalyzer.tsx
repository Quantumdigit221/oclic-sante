import React, { useState, useRef, useMemo } from 'react';
import { Upload, Camera, FileText, AlertCircle, CheckCircle, Loader2, Eye, Download } from 'lucide-react';
import GoogleVisionService from '../services/googleVisionService';
import { BillingRequired } from './BillingRequired';

interface AnalysisResult {
  success: boolean;
  documentType?: 'ordonnance' | 'resultat' | 'analyse' | 'autre';
  extractedData?: {
    patientName?: string;
    doctorName?: string;
    date?: string;
    medications?: string[];
    results?: string[];
  };
  text?: string;
  confidence?: number;
  error?: string;
}

export const VisionAnalyzer: React.FC<{
  onAnalysisComplete?: (result: AnalysisResult) => void;
  title?: string;
  acceptTypes?: string;
}> = ({ 
  onAnalysisComplete, 
  title = "Analyse de Document Médical",
  acceptTypes = "image/*,.pdf"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [billingError, setBillingError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialiser avec la clé API par défaut
  const defaultApiKey = 'AIzaSyBHoOTn7PxUDVRKiq8OTrcwoEkrFpuP3VQ';
  const [apiKey, setApiKey] = useState(defaultApiKey);
  const visionService = useMemo(() => new GoogleVisionService(apiKey), [apiKey]);

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
      } else {
        setPreview(''); // Pas d'aperçu pour les PDF
      }
      
      setResult(null);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile || !apiKey) return;

    setAnalyzing(true);
    setResult(null);

    try {
      // Convertir le fichier en base64
      const base64 = await GoogleVisionService.fileToBase64(selectedFile);
      
      // Analyser avec Google Vision
      const analysisResult = await visionService.analyzeMedicalDocument(base64);
      
      setResult(analysisResult);
      onAnalysisComplete?.(analysisResult);
      
    } catch (error) {
      console.error('Erreur extraction texte:', error);
      
      // Vérifier si c'est une erreur de facturation
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      if (errorMessage.includes('billing') || errorMessage.includes('facturation')) {
        setBillingError(true);
      }
      
      setResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const extractTextOnly = async () => {
    if (!selectedFile || !apiKey) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const base64 = await GoogleVisionService.fileToBase64(selectedFile);
      const ocrResult = await visionService.extractTextFromImage(base64);
      
      setResult({
        success: ocrResult.success,
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        error: ocrResult.error
      });
      
    } catch (error) {
      console.error('Erreur extraction texte:', error);
      
      // Vérifier si c'est une erreur de facturation
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      if (errorMessage.includes('billing') || errorMessage.includes('facturation')) {
        setBillingError(true);
      }
      
      setResult({
        success: false,
        error: errorMessage
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getDocumentTypeIcon = (type?: string) => {
    switch (type) {
      case 'ordonnance': return '📋';
      case 'resultat': return '🔬';
      case 'analyse': return '🧪';
      default: return '📄';
    }
  };

  const getDocumentTypeColor = (type?: string) => {
    switch (type) {
      case 'ordonnance': return 'text-blue-600 bg-blue-50';
      case 'resultat': return 'text-green-600 bg-green-50';
      case 'analyse': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Eye className="w-5 h-5 text-teal-600" />
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Importez et analysez automatiquement vos documents médicaux
          </p>
        </div>
        
        <button
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
          className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-200 transition-colors"
        >
          <AlertCircle className="w-4 h-4 inline mr-2" />
          {visionService.isConfigured() ? 'API Configurée ✅' : 'Configurer API'}
        </button>
      </div>

      {/* Configuration API Key */}
      {showApiKeyInput && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-amber-800">
              Clé API Google Cloud Vision
            </label>
            {visionService.isConfigured() && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Configurée
              </span>
            )}
          </div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-amber-600">
              Obtenez votre clé API depuis la console Google Cloud Platform
            </p>
            {apiKey && (
              <button
                onClick={() => {
                  setApiKey('');
                  setShowApiKeyInput(false);
                }}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div className="mb-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors"
        >
          {preview ? (
            <div className="space-y-4">
              {selectedFile?.type.startsWith('image/') ? (
                <img src={preview} alt="Aperçu" className="max-h-64 mx-auto rounded-lg shadow-sm" />
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="w-16 h-16 text-slate-400" />
                  <p className="text-sm text-slate-600">{selectedFile?.name}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <Upload className="w-12 h-12 text-slate-400" />
              <div>
                <p className="text-lg font-medium text-slate-700">
                  Cliquez pour uploader ou glissez-déposez
                </p>
                <p className="text-sm text-slate-500">
                  Images (JPG, PNG) ou PDF
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

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={analyzeDocument}
            disabled={analyzing || !apiKey || apiKey.trim() === ''}
            className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Analyser le document
              </>
            )}
          </button>
          
          <button
            onClick={extractTextOnly}
            disabled={analyzing || !apiKey || apiKey.trim() === ''}
            className="flex-1 bg-slate-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extraction...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Extraire le texte seulement
              </>
            )}
          </button>
        </div>
      )}

      {/* Warning si pas de clé API */}
      {selectedFile && (!apiKey || apiKey.trim() === '') && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Clé API requise</p>
            <p className="text-amber-700 text-sm">
              Veuillez configurer votre clé API Google Cloud Vision pour analyser les documents.
            </p>
          </div>
        </div>
      )}

      {/* Billing Error */}
      {billingError && (
        <BillingRequired 
          projectId="403103163072"
          onBillingEnabled={() => {
            setBillingError(false);
            window.location.reload();
          }}
        />
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {result.success ? (
            <>
              {/* Document Type */}
              {result.documentType && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <span className="text-2xl">{getDocumentTypeIcon(result.documentType)}</span>
                  <div>
                    <p className="font-medium text-slate-900">
                      Type de document détecté
                    </p>
                    <p className={`text-sm font-medium px-2 py-1 rounded-full inline-block ${getDocumentTypeColor(result.documentType)}`}>
                      {result.documentType?.charAt(0).toUpperCase() + result.documentType?.slice(1)}
                    </p>
                  </div>
                </div>
              )}

              {/* Extracted Data */}
              {result.extractedData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.extractedData.patientName && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Patient</p>
                      <p className="text-blue-900">{result.extractedData.patientName}</p>
                    </div>
                  )}
                  
                  {result.extractedData.doctorName && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Médecin</p>
                      <p className="text-green-900">{result.extractedData.doctorName}</p>
                    </div>
                  )}
                  
                  {result.extractedData.date && (
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm font-medium text-amber-800">Date</p>
                      <p className="text-amber-900">{result.extractedData.date}</p>
                    </div>
                  )}
                  
                  {result.confidence && (
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">Confiance</p>
                      <p className="text-purple-900">{Math.round(result.confidence * 100)}%</p>
                    </div>
                  )}
                </div>
              )}

              {/* Medications */}
              {result.extractedData?.medications && result.extractedData.medications.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">Médicaments détectés</p>
                  <ul className="space-y-1">
                    {result.extractedData.medications.map((med, index) => (
                      <li key={index} className="text-blue-900 text-sm">• {med}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Results */}
              {result.extractedData?.results && result.extractedData.results.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-800 mb-2">Résultats d'analyse</p>
                  <ul className="space-y-1">
                    {result.extractedData.results.map((result, index) => (
                      <li key={index} className="text-green-900 text-sm">• {result}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Full Text */}
              {result.text && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-slate-800">Texte complet extrait</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.text || '')}
                      className="text-sm text-teal-600 hover:text-teal-700"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      Copier
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded border border-slate-200 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap">{result.text}</pre>
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default VisionAnalyzer;
