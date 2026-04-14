import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Share2, 
  Printer, 
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  Brain,
  Heart,
  Bone,
  Stethoscope,
  Calendar,
  User,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DetailedFinding {
  id: string;
  type: string;
  description: string;
  confidence: number;
  location: string;
  severity: 'mild' | 'moderate' | 'severe';
  size?: string;
  characteristics: string[];
  differentialDiagnosis: string[];
  recommendations: string[];
  followUp: string;
  clinicalSignificance: 'low' | 'medium' | 'high';
  comparison?: {
    previous?: string;
    evolution: 'improved' | 'stable' | 'worsened' | 'new';
  };
}

interface DetailedReport {
  id: string;
  timestamp: Date;
  patientInfo: {
    name: string;
    age: number;
    gender: 'M' | 'F';
    id: string;
  };
  imageInfo: {
    type: string;
    date: Date;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    technique: string;
    view: string;
  };
  findings: DetailedFinding[];
  overallAssessment: {
    impression: string;
    confidence: number;
    urgency: 'low' | 'medium' | 'high';
    criticalFindings: string[];
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  radiologistReview?: {
    reviewed: boolean;
    reviewer: string;
    reviewDate: Date;
    comments: string;
    agreement: 'complete' | 'partial' | 'disagree';
  };
}

interface DetailedAIReportProps {
  report: DetailedReport;
  onPrint?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

function DetailedAIReport({ report, onPrint, onShare, onExport }: DetailedAIReportProps) {
  const [activeTab, setActiveTab] = useState<'findings' | 'comparison' | 'recommendations'>('findings');
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  // Vérifications de sécurité pour éviter les erreurs filter
  const findingsList = Array.isArray(report?.findings) ? report.findings : [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'mild': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe': return <AlertTriangle className="w-4 h-4" />;
      case 'moderate': return <AlertTriangle className="w-4 h-4" />;
      case 'mild': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getEvolutionIcon = (evolution: string) => {
    switch (evolution) {
      case 'improved': return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'worsened': return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'stable': return <Minus className="w-4 h-4 text-yellow-600" />;
      case 'new': return <Activity className="w-4 h-4 text-blue-600" />;
      default: return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* En-tête du rapport */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Rapport de Diagnostic IA Détaillé</h1>
              <p className="text-slate-500">Analyse approfondie d'imagerie médicale</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              title="Imprimer"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onShare}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              title="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onExport}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              title="Exporter"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informations patient et examen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4" />
              Informations Patient
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Nom:</span>
                <span className="font-medium">{report.patientInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">ID Patient:</span>
                <span className="font-medium">{report.patientInfo.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Âge:</span>
                <span className="font-medium">{report.patientInfo.age} ans</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sexe:</span>
                <span className="font-medium">{report.patientInfo.gender === 'M' ? 'Masculin' : 'Féminin'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Informations Examen
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Type:</span>
                <span className="font-medium">{report.imageInfo.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium">{format(report.imageInfo.date, 'dd MMMM yyyy', { locale: fr })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vue:</span>
                <span className="font-medium">{report.imageInfo.view}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Qualité:</span>
                <span className="font-medium capitalize">{report.imageInfo.quality}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Évaluation globale */}
        <div className="border-t border-slate-200 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Confiance globale</div>
              <div className={`text-2xl font-bold ${getConfidenceColor(report.overallAssessment.confidence)}`}>
                {(report.overallAssessment.confidence * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Urgence</div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(report.overallAssessment.urgency)}`}>
                {report.overallAssessment.urgency === 'high' ? 'Urgente' : 
                 report.overallAssessment.urgency === 'medium' ? 'Modérée' : 'Faible'}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Date d'analyse</div>
              <div className="text-sm font-medium">
                {format(report.timestamp, 'dd MMMM yyyy HH:mm', { locale: fr })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('findings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'findings'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Découvertes ({report.findings.length})
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'comparison'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Comparaison
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'recommendations'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Recommandations
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Découvertes */}
          {activeTab === 'findings' && (
            <div className="space-y-4">
              {report.findings.map((finding) => (
                <div key={finding.id} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(finding.severity)}
                        <div>
                          <h4 className="font-semibold text-slate-900">{finding.type}</h4>
                          <p className="text-sm text-slate-600">{finding.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(finding.severity)}`}>
                          {finding.severity === 'severe' ? 'Sévère' : 
                           finding.severity === 'moderate' ? 'Modérée' : 'Légère'}
                        </span>
                        <span className={`text-sm font-medium ${getConfidenceColor(finding.confidence)}`}>
                          {(finding.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedFinding === finding.id && (
                    <div className="p-4 border-t border-slate-200 space-y-4">
                      {/* Caractéristiques détaillées */}
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Caractéristiques</h5>
                        <ul className="space-y-1">
                          {finding.characteristics.map((char, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                              {char}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Diagnostic différentiel */}
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Diagnostic différentiel</h5>
                        <div className="space-y-2">
                          {finding.differentialDiagnosis.map((diag, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                              <span className="text-sm text-slate-700">{diag}</span>
                              <span className="text-xs text-slate-500">
                                {index === 0 ? 'Plus probable' : index === 1 ? 'Possible' : 'Moins probable'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Informations de localisation */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-slate-900 mb-2">Localisation</h5>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="w-4 h-4" />
                            {finding.location}
                          </div>
                        </div>
                        {finding.size && (
                          <div>
                            <h5 className="font-medium text-slate-900 mb-2">Taille</h5>
                            <div className="text-sm text-slate-600">{finding.size}</div>
                          </div>
                        )}
                      </div>

                      {/* Suivi recommandé */}
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Suivi recommandé</h5>
                        <p className="text-sm text-slate-600">{finding.followUp}</p>
                      </div>

                      {/* Signification clinique */}
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Signification clinique</h5>
                        <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${
                          finding.clinicalSignificance === 'high' ? 'text-red-600 bg-red-50 border-red-200' :
                          finding.clinicalSignificance === 'medium' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                          'text-green-600 bg-green-50 border-green-200'
                        }`}>
                          {finding.clinicalSignificance === 'high' ? 'Élevée' :
                           finding.clinicalSignificance === 'medium' ? 'Modérée' : 'Faible'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Onglet Comparaison */}
          {activeTab === 'comparison' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-slate-900 mb-4">Évolution des anomalies</h4>
                <div className="space-y-3">
                  {findingsList.filter(f => f.comparison).map((finding) => (
                    <div key={finding.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getEvolutionIcon(finding.comparison!.evolution)}
                        <div>
                          <div className="font-medium text-slate-900">{finding.type}</div>
                          <div className="text-sm text-slate-500">
                            {finding.comparison!.previous && `Précédent: ${finding.comparison!.previous}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className={`font-medium ${
                          finding.comparison!.evolution === 'improved' ? 'text-green-600' :
                          finding.comparison!.evolution === 'worsened' ? 'text-red-600' :
                          finding.comparison!.evolution === 'new' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {finding.comparison!.evolution === 'improved' ? 'Amélioré' :
                           finding.comparison!.evolution === 'worsened' ? 'Aggravé' :
                           finding.comparison!.evolution === 'new' ? 'Nouveau' :
                           'Stable'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revue du radiologue */}
              {report.radiologistReview && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Revue du radiologue</h4>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Dr. {report.radiologistReview.reviewer}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        report.radiologistReview.agreement === 'complete' ? 'text-green-600 bg-green-50 border-green-200' :
                        report.radiologistReview.agreement === 'partial' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                        'text-red-600 bg-red-50 border-red-200'
                      }`}>
                        {report.radiologistReview.agreement === 'complete' ? 'Accord complet' :
                         report.radiologistReview.agreement === 'partial' ? 'Accord partiel' :
                         'Désaccord'}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 mb-2">
                      {format(report.radiologistReview.reviewDate, 'dd MMMM yyyy HH:mm', { locale: fr })}
                    </p>
                    <p className="text-sm text-blue-700">{report.radiologistReview.comments}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Onglet Recommandations */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              {/* Recommandations immédiates */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Actions immédiates
                </h4>
                <div className="space-y-2">
                  {report.recommendations.immediate.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-red-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommandations à court terme */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  À court terme (1-4 semaines)
                </h4>
                <div className="space-y-2">
                  {report.recommendations.shortTerm.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-yellow-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommandations à long terme */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  À long terme (1-6 mois)
                </h4>
                <div className="space-y-2">
                  {report.recommendations.longTerm.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-green-800">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impression générale */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-semibold text-slate-900 mb-3">Impression générale</h4>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-700">{report.overallAssessment.impression}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailedAIReport;
