// Service d'intégration réelle avec Google DeepMind Gemini
// Pour une analyse d'imagerie médicale professionnelle

import { DetailedReport, DetailedFinding, AIAnalysisRequest } from './aiDiagnosisService';

interface DeepMindConfig {
  apiKey: string;
  projectId: string;
  location: string;
  model: string;
}

export class RealAIDiagnosisService {
  private config: DeepMindConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_DEEPMIND_API_KEY || '',
      projectId: process.env.REACT_APP_DEEPMIND_PROJECT_ID || '',
      location: process.env.REACT_APP_DEEPMIND_LOCATION || 'us-central1',
      model: 'gemini-1.5-pro-vision'
    };
    
    this.baseUrl = `https://${this.config.location}-aiplatform.googleapis.com`;
  }

  // Vérification de la configuration
  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.projectId);
  }

  // Analyse avec Google DeepMind Gemini
  async analyzeWithDeepMind(request: AIAnalysisRequest): Promise<DetailedReport> {
    if (!this.isConfigured()) {
      throw new Error('Configuration DeepMind manquante. Vérifiez les variables d\'environnement.');
    }

    try {
      const startTime = Date.now();
      
      // Construction du prompt médical
      const prompt = this.buildMedicalPrompt(request.imageType);
      
      // Appel à l'API Gemini
      const response = await fetch(`${this.baseUrl}/v1/projects/${this.config.projectId}/locations/${this.config.location}/publishers/google/models/${this.config.model}:generateContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: this.getMimeType(request.imageType),
                    data: this.extractBase64Data(request.image)
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1,  // Pour des résultats cohérents
            maxOutputTokens: 2048,
            candidateCount: 1,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erreur API DeepMind: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;

      // Parser la réponse de Gemini
      const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const detailedReport = this.parseGeminiResponse(analysisText, request);
      
      console.log(`DeepMind analysis completed in ${processingTime}ms`);
      return detailedReport;

    } catch (error) {
      console.error('Erreur lors de l\'analyse DeepMind:', error);
      throw new Error(`Échec de l'analyse DeepMind: ${error.message}`);
    }
  }

  // Construction du prompt médical selon le type d'imagerie
  private buildMedicalPrompt(imageType: string): string {
    const prompts = {
      xray: `
        En tant que radiologue expert avec 15 ans d'expérience, analyse cette radiographie thoracique.
        
        Fournis une réponse JSON structurée EXACTEMENT comme suit:
        {
          "findings": [
            {
              "id": "finding_1",
              "type": "Type précis de l'anomalie",
              "description": "Description médicale détaillée avec terminologie radiologique standard",
              "confidence": 0.85,
              "location": "Localisation anatomique exacte (lobe, segment)",
              "severity": "mild|moderate|severe",
              "size": "dimensions en cm si applicable",
              "characteristics": [
                "caractéristique 1",
                "caractéristique 2"
              ],
              "differentialDiagnosis": [
                "diagnostic 1 (probabilité)",
                "diagnostic 2 (probabilité)"
              ],
              "recommendations": [
                "action 1",
                "action 2"
              ],
              "followUp": "plan de suivi précis",
              "clinicalSignificance": "low|medium|high"
            }
          ],
          "overallAssessment": {
            "impression": "Synthèse médicale concise",
            "confidence": 0.90,
            "urgency": "low|medium|high",
            "criticalFindings": ["liste des anomalies critiques"]
          },
          "recommendations": {
            "immediate": ["actions urgentes si nécessaire"],
            "shortTerm": ["actions 1-4 semaines"],
            "longTerm": ["actions 1-6 mois"]
          }
        }
        
        Sois précis dans:
        - La terminologie anatomique et radiologique
        - Les mesures exactes quand visibles
        - Les diagnostics différentiels pertinents
        - Les recommandations basées sur les guidelines médicales
        
        Si aucune anomalie significative, indique "examen normal" dans findings avec un tableau vide.
      `,
      
      ct: `
        En tant que neuroradiologue expert, analyse ce scanner cérébral.
        
        Fournis une analyse JSON structurée comme ci-dessus, en incluant:
        - Densité en Unités Hounsfield si visible
        - Effet de masse sur les structures adjacentes
        - Rehaussement après injection si visible
        - Localisation précise (lobe, gyrus)
        - Diagnostic différentiel neurologique
        - Urgence neurologique
        
        Sois particulièrement attentif aux signes d'urgence: hémorragie, œdème massif, effet de hernie.
      `,
      
      mri: `
        En tant que radiologue spécialisé en IRM, analyse cette image.
        
        Fournis une analyse JSON structurée en détaillant:
        - Caractéristiques du signal T1/T2/FLAIR
        - Rehaussement gadolinium si visible
        - Anatomie affectée (ligaments, ménisques, tendons, structures cérébrales)
        - Diagnostic différentiel orthopédique ou neurologique
        - Recommandations thérapeutiques spécifiques
        
        Pour les lésions ligamentaires: indiquer la continuité, le signal, et les lésions associées.
      `,
      
      ultrasound: `
        En tant que radiologue spécialisé en imagerie médicale, analyse cette échographie.
        
        Fournis une analyse JSON structurée avec:
        - Caractéristiques échogènes (hyper/hypo/isoéchogène)
        - Vascularisation au Doppler si visible
        - Aspect des parois (fines/épaisses, régulières/irrégulières)
        - Classification selon les systèmes appropriés (BI-RADS, TI-RADS, etc.)
        - Diagnostic différentiel approprié
        
        Pour les masses kystiques: contenu, parois, vascularisation, recommandations.
      `,
      
      retinal: `
        En tant qu'ophtalmologue, analyse cette rétinographie.
        
        Fournis une analyse JSON structurée incluant:
        - Microanévrysmes (nombre et distribution)
        - Exsudats (cireux/durs, localisation)
        - Hémorragies (type et distribution)
        - Œdème maculaire (présence/absence)
        - Néovascularisation si présente
        - Classification de la rétinopathie diabétique
        
        Utilise la terminologie ophtalmologique standard et les classifications ETDRS.
      `,
      
      bone: `
        En tant que radiologue musculo-squelettique, analyse cette radiographie osseuse.
        
        Fournis une analyse JSON structurée avec:
        - Type de fracture (complète/incomplète, déplacée/non)
        - Localisation anatomique précise
        - Orientation et déplacement
        - Lésions des parties molles associées
        - Réaction périostée si présente
        - Diagnostic différentiel (traumatique/pathologique)
        
        Pour les lésions tumorales: aspect lytique/blaste, limites, matrice.
      `
    };

    return prompts[imageType] || prompts.xray;
  }

  // Parsing de la réponse Gemini
  private parseGeminiResponse(responseText: string, request: AIAnalysisRequest): DetailedReport {
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide: JSON non trouvé');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      return {
        id: `deepmind_${Date.now()}`,
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
          quality: 'good', // À déterminer selon l'image
          technique: this.getTechniqueName(request.imageType),
          view: this.getViewName(request.imageType)
        },
        findings: parsedData.findings || [],
        overallAssessment: {
          impression: parsedData.overallAssessment?.impression || 'Analyse complétée',
          confidence: parsedData.overallAssessment?.confidence || 0.85,
          urgency: parsedData.overallAssessment?.urgency || 'medium',
          criticalFindings: parsedData.overallAssessment?.criticalFindings || []
        },
        recommendations: {
          immediate: parsedData.recommendations?.immediate || [],
          shortTerm: parsedData.recommendations?.shortTerm || [],
          longTerm: parsedData.recommendations?.longTerm || []
        },
        radiologistReview: {
          reviewed: false, // Sera ajouté lors de la revue manuelle
          reviewer: '',
          reviewDate: new Date(),
          comments: 'Analyse IA par Google DeepMind - En attente de validation médicale',
          agreement: 'partial'
        }
      };
    } catch (error) {
      console.error('Erreur parsing Gemini response:', error);
      throw new Error('Échec de l\'interprétation de la réponse IA');
    }
  }

  // Utilitaires pour le traitement des images
  private getMimeType(imageType: string): string {
    const mimeTypes = {
      xray: 'image/jpeg',
      ct: 'image/jpeg', 
      mri: 'image/jpeg',
      ultrasound: 'image/jpeg',
      retinal: 'image/jpeg',
      bone: 'image/jpeg'
    };
    return mimeTypes[imageType] || 'image/jpeg';
  }

  private extractBase64Data(imageData: string): string {
    // Extraire les données base64 de "data:image/jpeg;base64,..."
    return imageData.split(',')[1];
  }

  private getImageTypeName(type: string): string {
    const names = {
      xray: 'Radiographie thoracique',
      ct: 'Scanner thoracique',
      mri: 'IRM cérébrale',
      ultrasound: 'Échographie abdomino-pelvienne',
      retinal: 'Rétinographie',
      bone: 'Radiographie osseuse'
    };
    return names[type] || 'Imagerie médicale';
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
    return techniques[type] || 'Standard';
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
    return views[type] || 'Standard';
  }

  // Test de connexion à l'API
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/projects/${this.config.projectId}/locations/${this.config.location}/publishers/google/models/${this.config.model}:generateContent`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Test connection - respond with "OK"' }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Obtenir les informations sur le modèle
  async getModelInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/projects/${this.config.projectId}/locations/${this.config.location}/publishers/google/models/${this.config.model}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get model info');
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get model info:', error);
      throw error;
    }
  }
}

export default RealAIDiagnosisService;
