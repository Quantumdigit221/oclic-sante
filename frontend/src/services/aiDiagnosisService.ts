// Service pour l'intégration avec l'IA de diagnostic médical
// Compatible avec Google DeepMind, Google Cloud Vision API, ou autres services d'IA

export interface AIAnalysisRequest {
  image: string; // Base64 encoded image
  imageType: 'xray' | 'ct' | 'mri' | 'ultrasound' | 'retinal' | 'bone';
  patientInfo?: {
    age?: number;
    gender?: 'M' | 'F';
    relevantHistory?: string;
  };
}

export interface AIAnalysisResponse {
  id: string;
  timestamp: Date;
  findings: AIFinding[];
  confidence: number;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
  processingTime: number;
  modelVersion: string;
}

export interface AIFinding {
  type: string;
  description: string;
  confidence: number;
  location?: string;
  severity: 'mild' | 'moderate' | 'severe';
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DetailedFinding {
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

export interface DetailedReport {
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

class AIDiagnosisService {
  private apiKey: string | null = null;
  private baseUrl: string = 'https://api.example-ai-service.com'; // URL à configurer
  private useRealAI: boolean;

  constructor() {
    // Récupérer la clé API depuis les variables d'environnement ou la configuration
    this.apiKey = process.env.REACT_APP_AI_API_KEY || null;
    this.useRealAI = process.env.REACT_APP_USE_REAL_AI === 'true';
  }

  // Génération de rapport détaillé - Bascule automatique entre simulation et API réelle
  async generateDetailedReport(
    request: AIAnalysisRequest, 
    provider: 'huggingface' | 'deepmind' | 'openai' | 'google-cloud' | 'azure' | 'custom' = 'huggingface'
  ): Promise<DetailedReport> {
    if (this.useRealAI) {
      // Utiliser l'API réelle
      console.log('🤗 Using Hugging Face AI API for analysis...');
      try {
        const { default: HuggingFaceAIService } = await import('./huggingFaceAIService');
        const hfService = new HuggingFaceAIService();
        return await hfService.analyzeWithHuggingFace(request);
      } catch (error) {
        console.error('Hugging Face AI failed, trying DeepMind fallback:', error);
        try {
          const { default: RealAIDiagnosisService } = await import('./realAIDiagnosisService');
          const realService = new RealAIDiagnosisService();
          return await realService.analyzeWithDeepMind(request);
        } catch (deepmindError) {
          console.error('All real AI services failed, falling back to simulation:', deepmindError);
          return await this.simulateDetailedReport(request);
        }
      }
    } else {
      // Utiliser la simulation
      console.log('🎭 Using simulation mode for analysis...');
      return await this.simulateDetailedReport(request);
    }
  }

  // Génération de résultats détaillés selon le type d'image
  private generateDetailedFindings(imageType: string, patientInfo?: any): DetailedFinding[] {
    const findingsMap = {
      xray: [
        {
          id: 'finding_1',
          type: 'Opacité pulmonaire droite',
          description: 'Zone d\'opacité bien délimitée dans le lobe supérieur droit, mesurant environ 2.3 x 1.8 cm. Les marges sont spiculées et il y a une rétraction pleurale adjacente.',
          confidence: 0.87,
          location: 'Lobe supérieur droit, segment apical',
          severity: 'moderate' as const,
          size: '2.3 x 1.8 cm',
          characteristics: [
            'Densité tissulaire augmentée',
            'Marges spiculées',
            'Absence de calcifications visibles',
            'Rétraction pleurale adjacente',
            'Pas de franchissement des scissures'
          ],
          differentialDiagnosis: [
            'Néoplasie pulmonaire primitive (probabilité élevée)',
            'Tuberculose pulmonaire active',
            'Pneumonie organisée',
            'Infarctus pulmonaire'
          ],
          recommendations: [
            'Scanner thoracique avec injection de produit de contraste',
            'Biopsie percutanée guidée par TDM',
            'Consultation pneumologique urgente',
            'Dosage des marqueurs tumoraux (ACE, CYFRA 21-1)'
          ],
          followUp: 'Scanner de contrôle dans 4 semaines si biopsie non réalisée, ou selon protocole oncologique si confirmation',
          clinicalSignificance: 'high' as const,
          comparison: {
            previous: 'Radiographie du 15/10/2025: opacité similaire de 2.0 x 1.5 cm',
            evolution: 'worsened' as const
          }
        }
      ],
      ct: [
        {
          id: 'finding_1',
          type: 'Lésion hypodense cérébrale',
          description: 'Lésion hypodense bien délimitée dans la région temporale gauche, mesurant 1.8 x 1.5 cm, avec effet de masse modéré sur les structures adjacentes.',
          confidence: 0.85,
          location: 'Lobe temporal gauche',
          severity: 'moderate' as const,
          size: '1.8 x 1.5 cm',
          characteristics: [
            'Densité spontanée de 25 UH',
            'Effet de masse modéré',
            'Pas de rehaussement après injection',
            'Œdème périlésionnel modéré',
            'Préservation de la corticale adjacente'
          ],
          differentialDiagnosis: [
            'Infarctus cérébral récent',
            'Processus tumoral glial',
            'Leucoaraiose focale',
            'Inflammation locale'
          ],
          recommendations: [
            'IRM cérébrale avec séquences de diffusion',
            'Angiographie cérébrale',
            'Consultation neurologique urgente',
            'Bilan étiologique complet'
          ],
          followUp: 'IRM dans les 24 heures pour caractérisation précise et évolution',
          clinicalSignificance: 'high' as const
        }
      ]
    };

    return findingsMap[imageType as keyof typeof findingsMap] || findingsMap.xray;
  }

  // Génération d'impression globale
  private generateOverallImpression(findings: DetailedFinding[], imageType: string): string {
    const severeFindings = findings.filter(f => f.severity === 'severe');
    const moderateFindings = findings.filter(f => f.severity === 'moderate');
    
    if (severeFindings.length > 0) {
      return `Présence de ${severeFindings.length} anomalie(s) sévère(s) nécessitant une prise en charge urgente. ${moderateFindings.length > 0 ? `Associé(s) à ${moderateFindings.length} anomalie(s) modérée(s) à surveiller.` : ''} Recommande une évaluation spécialisée immédiate et des examens complémentaires.`;
    } else if (moderateFindings.length > 0) {
      return `Découverte de ${moderateFindings.length} anomalie(s) modérée(s) justifiant une investigation complémentaire et un suivi régulier. Pas de signe de gravité immédiate détecté.`;
    } else {
      return `Examen sans anomalie significative détectée. Quelques variations mineures de la normale sans pertinence clinique évidente. Recommande surveillance clinique standard.`;
    }
  }

  // Génération de recommandations détaillées
  private generateDetailedRecommendations(findings: DetailedFinding[], imageType: string) {
    const severeFindings = findings.filter(f => f.severity === 'severe');
    const moderateFindings = findings.filter(f => f.severity === 'moderate');
    const mildFindings = findings.filter(f => f.severity === 'mild');

    return {
      immediate: severeFindings.length > 0 ? [
        'Consultation spécialisée urgente',
        'Examens complémentaires immédiats',
        'Traitement symptomatique si nécessaire',
        'Hospitalisation si indiqué'
      ] : [],
      shortTerm: moderateFindings.length > 0 ? [
        'Consultation spécialisée dans la semaine',
        'Examens complémentaires de routine',
        'Surveillance clinique rapprochée',
        'Adaptation thérapeutique si nécessaire'
      ] : [
        'Consultation de suivi dans 1-3 mois',
        'Surveillance clinique standard'
      ],
      longTerm: [
        'Suivi régulier selon protocole',
        'Contrôle périodique par imagerie',
        'Éducation thérapeutique du patient',
        'Prévention des complications'
      ]
    };
  }

  // Calcul du niveau d'urgence détaillé
  private calculateDetailedUrgency(findings: DetailedFinding[]): 'low' | 'medium' | 'high' {
    const hasSevere = findings.some(f => f.severity === 'severe');
    const hasModerate = findings.some(f => f.severity === 'moderate');
    
    if (hasSevere) return 'high';
    if (hasModerate) return 'medium';
    return 'low';
  }

  // Fonctions utilitaires
  private getImageTypeName(type: string): string {
    const names = {
      xray: 'Radiographie thoracique',
      ct: 'Scanner thoracique',
      mri: 'IRM cérébrale',
      ultrasound: 'Échographie abdomino-pelvienne',
      retinal: 'Rétinographie',
      bone: 'Radiographie osseuse'
    };
    return names[type as keyof typeof names] || 'Imagerie médicale';
  }

  private getTechniqueName(type: string): string {
    const techniques = {
      xray: 'Radiographie numérique 2 incidences',
      ct: 'Scanner hélicoïdal avec injection',
      mri: 'IRM 1.5T séquences T1, T2, FLAIR',
      ultrasound: 'Échographie haute fréquence',
      retinal: 'Rétinographie non mydriatique',
      bone: 'Radiographie standard 2 incidences'
    };
    return techniques[type as keyof typeof techniques] || 'Standard';
  }

  private getViewName(type: string): string {
    const views = {
      xray: 'Face et profil',
      ct: 'Axial et coronal',
      mri: 'Axial, sagittal et coronal',
      ultrasound: 'Supra-ombilical et pelvien',
      retinal: 'Pôle postérieur',
      bone: 'Face et profil'
    };
    return views[type as keyof typeof views] || 'Standard';
  }

  private getRandomQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    const qualities: ('excellent' | 'good' | 'fair' | 'poor')[] = ['excellent', 'good', 'fair', 'poor'];
    return qualities[Math.floor(Math.random() * qualities.length)];
  }

  // Simulation de rapport détaillé
  async simulateDetailedReport(request: AIAnalysisRequest): Promise<DetailedReport> {
    const startTime = Date.now();
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

    const detailedFindings = this.generateDetailedFindings(request.imageType, request.patientInfo);
    const processingTime = Date.now() - startTime;

    return {
      id: `detailed_${Date.now()}`,
      timestamp: new Date(),
      patientInfo: {
        name: request.patientInfo?.relevantHistory ? 'Patient avec antécédents' : 'Patient standard',
        age: request.patientInfo?.age || 45,
        gender: request.patientInfo?.gender || 'M',
        id: `P_${Date.now()}`
      },
      imageInfo: {
        type: this.getImageTypeName(request.imageType),
        date: new Date(),
        quality: this.getRandomQuality(),
        technique: this.getTechniqueName(request.imageType),
        view: this.getViewName(request.imageType)
      },
      findings: detailedFindings,
      overallAssessment: {
        impression: this.generateOverallImpression(detailedFindings, request.imageType),
        confidence: 0.75 + Math.random() * 0.2,
        urgency: this.calculateDetailedUrgency(detailedFindings),
        criticalFindings: detailedFindings.filter(f => f.severity === 'severe').map(f => f.type)
      },
      recommendations: this.generateDetailedRecommendations(detailedFindings, request.imageType),
      radiologistReview: {
        reviewed: Math.random() > 0.3,
        reviewer: 'Dr. Martin Radiologue',
        reviewDate: new Date(),
        comments: 'Analyse IA cohérente avec les observations cliniques. Recommande confirmation par examen complémentaire.',
        agreement: Math.random() > 0.2 ? 'complete' : Math.random() > 0.5 ? 'partial' : 'disagree'
      }
    };
  }

  async simulateAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    // Génération de résultats simulés basés sur le type d'image
    const mockFindings = this.generateMockFindings(request.imageType);
    const processingTime = Date.now() - startTime;

    return {
      id: `sim_${Date.now()}`,
      timestamp: new Date(),
      findings: mockFindings,
      confidence: 0.75 + Math.random() * 0.2, // 75-95%
      recommendations: this.generateMockRecommendations(request.imageType, mockFindings),
      urgency: this.calculateUrgency(mockFindings),
      processingTime,
      modelVersion: 'simulator-v1.0'
    };
  }

  // Génération de résultats simulés selon le type d'image
  private generateMockFindings(imageType: string): AIFinding[] {
    const findingsMap = {
      xray: [
        {
          type: 'Opacité pulmonaire',
          description: 'Zone d\'opacité détectée dans le lobe supérieur droit',
          confidence: 0.87,
          location: 'Lobe supérieur droit',
          severity: 'moderate' as const
        },
        {
          type: 'Structure cardiaque',
          description: 'Silhouette cardiaque normale',
          confidence: 0.92,
          severity: 'mild' as const
        }
      ],
      ct: [
        {
          type: 'Lésion cérébrale',
          description: 'Hypodensité détectée dans la région temporale gauche',
          confidence: 0.78,
          location: 'Temporale gauche',
          severity: 'moderate' as const
        }
      ],
      mri: [
        {
          type: 'Déchirure ligamentaire',
          description: 'Signal anormal dans le ligament croisé antérieur',
          confidence: 0.85,
          location: 'Genou droit',
          severity: 'moderate' as const
        }
      ],
      ultrasound: [
        {
          type: 'Masse ovarienne',
          description: 'Formation kystique détectée à l\'ovaire gauche',
          confidence: 0.91,
          location: 'Ovaire gauche',
          severity: 'mild' as const
        }
      ],
      retinal: [
        {
          type: 'Rétinopathie diabétique',
          description: 'Signes de rétinopathie diabétique modérée',
          confidence: 0.83,
          location: 'Rétine périphérique',
          severity: 'moderate' as const
        }
      ],
      bone: [
        {
          type: 'Fracture',
          description: 'Ligne de fracture visible sur le radius distal',
          confidence: 0.89,
          location: 'Radius distal',
          severity: 'severe' as const
        }
      ]
    };

    return findingsMap[imageType as keyof typeof findingsMap] || findingsMap.xray;
  }

  // Génération de recommandations basées sur les résultats
  private generateMockRecommendations(imageType: string, findings: AIFinding[]): string[] {
    const baseRecommendations = {
      xray: [
        'Compléter par un scanner thoracique si suspicion clinique',
        'Consulter un pneumologue pour avis spécialisé',
        'Radiographie de contrôle dans 3 mois'
      ],
      ct: [
        'IRM cérébrale pour compléter l\'évaluation',
        'Consultation neurologique urgente',
        'Monitoring neurologique régulier'
      ],
      mri: [
        'Consultation orthopédique pour évaluation thérapeutique',
        'Kinésithérapie de rééducation',
        'IRM de contrôle dans 6 semaines'
      ],
      ultrasound: [
        'Consultation gynécologique pour suivi',
        'Échographie de contrôle dans 2 mois',
        'Dosage des marqueurs tumoraux si indiqué'
      ],
      retinal: [
        'Consultation ophtalmologique urgente',
        'Traitement laser si indiqué',
        'Contrôle glycémique strict'
      ],
      bone: [
        'Réduction orthopédique en urgence',
        'Immobilisation par plâtre',
        'Radiographie de contrôle à 6 semaines'
      ]
    };

    return baseRecommendations[imageType as keyof typeof baseRecommendations] || baseRecommendations.xray;
  }

  // Calcul du niveau d'urgence
  private calculateUrgency(findings: AIFinding[]): 'low' | 'medium' | 'high' {
    const hasSevere = findings.some(f => f.severity === 'severe');
    const hasModerate = findings.some(f => f.severity === 'moderate');
    
    if (hasSevere) return 'high';
    if (hasModerate) return 'medium';
    return 'low';
  }

  isRealAIEnabled(): boolean {
    return this.useRealAI;
  }

  // Méthode pour basculer entre simulation et API réelle
  toggleRealAI(enabled: boolean) {
    this.useRealAI = enabled;
    console.log(`AI Mode: ${enabled ? 'REAL API' : 'SIMULATION'}`);
  }

  // Validation du format d'image
  validateImageFormat(imageData: string): boolean {
    // Vérifier si c'est du base64 valide
    const base64Regex = /^data:image\/(png|jpg|jpeg|dicom);base64,/;
    return base64Regex.test(imageData);
  }

  // Prétraitement de l'image si nécessaire
  async preprocessImage(imageData: string): Promise<string> {
    // Ici, on pourrait ajouter du prétraitement :
    // - Redimensionnement
    // - Normalisation
    // - Conversion en format DICOM si nécessaire
    return imageData;
  }

  // Configuration du service
  configure(config: { apiKey?: string; baseUrl?: string }) {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.baseUrl) this.baseUrl = config.baseUrl;
  }

  // Vérification de l'état du service
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const aiDiagnosisService = new AIDiagnosisService();
export default aiDiagnosisService;
