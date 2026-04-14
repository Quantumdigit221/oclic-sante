import React, { useState, useRef, useCallback } from 'react';
import { useStore } from '../store';
import { 
  Brain, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Activity,
  Eye,
  Heart,
  Bone,
  FileSearch
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { aiDiagnosisService, DetailedReport } from '../services/aiDiagnosisService';
import DetailedAIReport from '../components/DetailedAIReport';

interface AnalysisResult {
  id: string;
  timestamp: Date;
  imageType: string;
  findings: Finding[];
  confidence: number;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
  processedImageUrl?: string;
}

interface Finding {
  type: string;
  description: string;
  confidence: number;
  location?: string;
  severity: 'mild' | 'moderate' | 'severe';
}

const IMAGE_TYPES = [
  { id: 'xray', name: 'Radiographie', icon: Activity, description: 'Radiographies thoraciques, osseuses, etc.' },
  { id: 'ct', name: 'Scanner CT', icon: Activity, description: 'Tomodensitométrie' },
  { id: 'mri', name: 'IRM', icon: Brain, description: 'Imagerie par résonance magnétique' },
  { id: 'ultrasound', name: 'Échographie', icon: Heart, description: 'Échographies diverses' },
  { id: 'retinal', name: 'Rétine', icon: Eye, description: 'Fond d\'œil, rétinographie' },
  { id: 'bone', name: 'Os', icon: Bone, description: 'Radiographies osseuses spécifiques' }
];

function DiagnosisAI() {
  const { currentCenter, currentUser } = useStore();
  const [selectedImageType, setSelectedImageType] = useState<string>('xray');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedReport | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setError(null);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDetailedAnalysis = useCallback(async () => {
    if (!uploadedImage) {
      setError('Veuillez d\'abord télécharger une image');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const request = {
        image: uploadedImage,
        imageType: selectedImageType as any,
        patientInfo: {
          age: 45,
          gender: 'M' as const,
          relevantHistory: 'Patient avec antécédents respiratoires'
        }
      };

      const report = await aiDiagnosisService.generateDetailedReport(request);
      setDetailedReport(report);
      setAnalysisHistory(prev => [{ ...report, type: 'detailed' }, ...prev]);
    } catch (err) {
      setError('Erreur lors de l\'analyse détaillée de l\'image');
      console.error('Detailed analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage, selectedImageType]);

  const handlePrintReport = useCallback(() => {
    if (detailedReport) {
      window.print();
    }
  }, [detailedReport]);

  const handleShareReport = useCallback(() => {
    if (detailedReport) {
      // Implémenter le partage
      alert('Fonction de partage à implémenter');
    }
  }, [detailedReport]);

  const handleExportReport = useCallback(() => {
    if (detailedReport) {
      const reportData = {
        'Rapport IA Détaillé': {
          'Patient': detailedReport.patientInfo,
          'Examen': detailedReport.imageInfo,
          'Date': format(detailedReport.timestamp, 'dd MMMM yyyy HH:mm', { locale: fr }),
          'Évaluation globale': detailedReport.overallAssessment,
          'Découvertes': detailedReport.findings.map(f => ({
            'Type': f.type,
            'Description': f.description,
            'Confiance': `${(f.confidence * 100).toFixed(1)}%`,
            'Localisation': f.location,
            'Sévérité': f.severity,
            'Taille': f.size || 'N/A',
            'Caractéristiques': f.characteristics,
            'Diagnostic différentiel': f.differentialDiagnosis,
            'Signification clinique': f.clinicalSignificance
          })),
          'Recommandations': detailedReport.recommendations,
          'Revue radiologue': detailedReport.radiologistReview
        }
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_ia_detaille_${format(detailedReport.timestamp, 'dd-MM-yyyy_HH-mm')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [detailedReport]);

  const simulateAIAnalysis = useCallback(async (): Promise<AnalysisResult> => {
    // Simulation d'analyse IA (remplacer par appel API réel)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const mockFindings: Finding[] = [
      {
        type: 'Anomalie détectée',
        description: 'Présence d\'opacités anormales dans le champ pulmonaire droit',
        confidence: 0.87,
        location: 'Lobe supérieur droit',
        severity: 'moderate'
      },
      {
        type: 'Structure normale',
        description: 'Cœur et médiastin d\'aspect normal',
        confidence: 0.92,
        severity: 'mild'
      }
    ];

    return {
      id: `analysis_${Date.now()}`,
      timestamp: new Date(),
      imageType: selectedImageType,
      findings: mockFindings,
      confidence: 0.89,
      recommendations: [
        'Compléter par un scanner thoracique si suspicion clinique',
        'Consulter un pneumologue pour avis spécialisé',
        'Radiographie de contrôle dans 3 mois'
      ],
      urgency: 'medium',
      processedImageUrl: uploadedImage || undefined
    };
  }, [selectedImageType, uploadedImage]);

  const handleAnalysis = useCallback(async () => {
    if (!uploadedImage) {
      setError('Veuillez d\'abord télécharger une image');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await simulateAIAnalysis();
      setAnalysisResult(result);
      setAnalysisHistory(prev => [result, ...prev]);
    } catch (err) {
      setError('Erreur lors de l\'analyse de l\'image');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage, simulateAIAnalysis]);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600';
      case 'moderate': return 'text-yellow-600';
      case 'mild': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const downloadReport = useCallback((result: AnalysisResult) => {
    const report = {
      'Rapport d\'Analyse IA': {
        'Date': format(result.timestamp, 'dd MMMM yyyy HH:mm', { locale: fr }),
        'Type d\'image': IMAGE_TYPES.find(t => t.id === result.imageType)?.name,
        'Confiance globale': `${(result.confidence * 100).toFixed(1)}%`,
        'Urgence': result.urgency,
        'Résultats': result.findings.map(f => ({
          'Type': f.type,
          'Description': f.description,
          'Confiance': `${(f.confidence * 100).toFixed(1)}%`,
          'Localisation': f.location || 'N/A',
          'Sévérité': f.severity
        })),
        'Recommandations': result.recommendations
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_ia_${format(result.timestamp, 'dd-MM-yyyy_HH-mm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Diagnostic par IA</h1>
            <p className="text-slate-500">Analyse d\'imagerie médicale assistée par intelligence artificielle</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section gauche : Upload et configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sélection du type d'image */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Type d'imagerie</h3>
            <div className="space-y-2">
              {IMAGE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedImageType(type.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedImageType === type.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-slate-900">{type.name}</div>
                        <div className="text-sm text-slate-500">{type.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload d'image */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Télécharger l'image</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {!uploadedImage ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-purple-500 transition-colors"
              >
                <div className="flex flex-col items-center gap-3">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <div className="text-center">
                    <p className="text-slate-600 font-medium">Cliquez pour télécharger</p>
                    <p className="text-slate-500 text-sm">ou glissez-déposez une image</p>
                    <p className="text-slate-400 text-xs mt-1">PNG, JPG, DICOM (max 10MB)</p>
                  </div>
                </div>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img 
                    src={uploadedImage} 
                    alt="Image médicale" 
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setAnalysisResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Changer d'image
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalysis}
              disabled={!uploadedImage || isAnalyzing}
              className="w-full mt-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Lancer l'analyse IA
                </>
              )}
            </button>

            <button
              onClick={handleDetailedAnalysis}
              disabled={!uploadedImage || isAnalyzing}
              className="w-full mt-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Analyse détaillée...
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  Analyse détaillée
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section droite : Résultats */}
        <div className="lg:col-span-2 space-y-6">
          {analysisResult && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Résultats de l'analyse</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(analysisResult.urgency)}`}>
                    {analysisResult.urgency === 'high' ? 'Urgent' : 
                     analysisResult.urgency === 'medium' ? 'Modéré' : 'Faible'}
                  </span>
                  <button
                    onClick={() => downloadReport(analysisResult)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500">Confiance globale</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {(analysisResult.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-sm text-slate-500">Date d'analyse</div>
                  <div className="text-sm font-medium text-slate-900">
                    {format(analysisResult.timestamp, 'dd MMMM yyyy HH:mm', { locale: fr })}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Découvertes</h4>
                {analysisResult.findings.map((finding, index) => (
                  <div key={index} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-slate-900">{finding.type}</div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getSeverityColor(finding.severity)}`}>
                          {finding.severity === 'severe' ? 'Sévère' : 
                           finding.severity === 'moderate' ? 'Modéré' : 'Léger'}
                        </span>
                        <span className="text-sm text-slate-500">
                          {(finding.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm mb-2">{finding.description}</p>
                    {finding.location && (
                      <p className="text-slate-500 text-xs">Localisation: {finding.location}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="font-semibold text-slate-900 mb-3">Recommandations</h4>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-slate-600">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Historique des analyses */}
          {analysisHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Historique des analyses</h3>
              <div className="space-y-3">
                {analysisHistory.map((result) => (
                  <div key={result.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <ImageIcon className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {IMAGE_TYPES.find(t => t.id === result.imageType)?.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {format(result.timestamp, 'dd MMMM yyyy HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(result.urgency)}`}>
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                        <button
                          onClick={() => setAnalysisResult(result)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rapport détaillé */}
          {detailedReport && (
            <DetailedAIReport
              report={detailedReport}
              onPrint={handlePrintReport}
              onShare={handleShareReport}
              onExport={handleExportReport}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DiagnosisAI;
