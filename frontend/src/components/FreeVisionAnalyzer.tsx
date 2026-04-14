import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, AlertCircle, CheckCircle, Loader2, Eye, Download, Zap } from 'lucide-react';
import FreeOCRService from '../services/freeOCRService';

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
  provider?: string;
}

export const FreeVisionAnalyzer: React.FC<{
  onAnalysisComplete?: (result: AnalysisResult) => void;
  title?: string;
  acceptTypes?: string;
}> = ({ 
  onAnalysisComplete, 
  title = "Analyse GRATUITE de Document Médical",
  acceptTypes = "image/*,.pdf"
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const freeOCRService = FreeOCRService.getInstance();

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
        setPreview('');
      }
      
      setResult(null);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setResult(null);

    try {
      // Convertir le fichier en base64
      const base64 = await FreeOCRService.fileToBase64(selectedFile);
      
      // Analyser avec le service GRATUIT
      const analysisResult = await freeOCRService.analyzeDocument(base64);
      
      // Ajouter le provider
      const resultWithProvider = {
        ...analysisResult,
        provider: 'Free OCR (Tesseract + WebOCR)'
      };
      
      setResult(resultWithProvider);
      onAnalysisComplete?.(resultWithProvider);
      
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'analyse',
        provider: 'Free OCR'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const extractTextOnly = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setResult(null);

    try {
      const base64 = await FreeOCRService.fileToBase64(selectedFile);
      
      // Utiliser Tesseract.js (plus précis)
      const ocrResult = await freeOCRService.extractTextWithTesseract(base64);
      
      setResult({
        success: ocrResult.success,
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        error: ocrResult.error,
        provider: `Tesseract.js (Gratuit & Hors ligne)`
      });
      
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'extraction',
        provider: 'Free OCR'
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
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Analyse 100% GRATUITE avec Tesseract.js OCR - Précision professionnelle, Aucune carte de crédit requise
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            100% GRATUIT 🎉
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            HORS LIGNE
          </span>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-colors"
        >
          {preview ? (
            <div className="space-y-4">
              {selectedFile?.type.startsWith('image/') ? (
                <img src={preview} alt="Aperçu" className="max-h-64 mx-auto rounded-lg shadow-sm" />
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="w-16 h-16 text-green-400" />
                  <p className="text-sm text-green-600">{selectedFile?.name}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <Upload className="w-12 h-12 text-green-400" />
              <div>
                <p className="text-lg font-medium text-slate-700">
                  Cliquez pour uploader ou glissez-déposez
                </p>
                <p className="text-sm text-slate-500">
                  Images (JPG, PNG) - OCR Tesseract.js GRATUIT
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
            disabled={analyzing}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyse gratuite en cours...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Analyser GRATUITEMENT
              </>
            )}
          </button>
          
          <button
            onClick={extractTextOnly}
            disabled={analyzing}
            className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extraction...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Extraire le texte
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
              {/* Provider Info */}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Analyse réussie avec {result.provider}
                  </p>
                  {result.confidence && (
                    <p className="text-green-700 text-sm">
                      Confiance : {Math.round(result.confidence * 100)}%
                    </p>
                  )}
                </div>
              </div>

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
                    <p className="font-medium text-slate-800">Texte complet extrait (GRATUIT)</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.text || '')}
                      className="text-sm text-green-600 hover:text-green-700"
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

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-green-100 rounded-lg">
        <p className="text-sm text-green-800 text-center">
          <strong>💚 Solution 100% GRATUITE avec Tesseract.js</strong> - 
          OCR professionnel hors ligne, aucune carte de crédit requise, aucune limite d'utilisation.
        </p>
      </div>
    </div>
  );
};

export default FreeVisionAnalyzer;
