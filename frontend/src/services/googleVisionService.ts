// Configuration Google Cloud Vision
const VISION_API_ENDPOINT = 'https://vision.googleapis.com/v1/images:annotate';
const PROJECT_ID = 'votre-project-id'; // À remplacer
const LOCATION = 'us-central1'; // ou 'europe-west1' pour l'Europe

interface VisionAnnotation {
  description?: string;
  locale?: string;
  boundingPoly?: {
    vertices?: Array<{ x?: number; y?: number }>;
  };
}

interface VisionResponse {
  responses: Array<{
    textAnnotations?: VisionAnnotation[];
    fullTextAnnotation?: {
      text?: string;
      pages?: Array<{
        blocks?: Array<{
          paragraphs?: Array<{
            words?: Array<{
              symbols?: Array<{
                text?: string;
                confidence?: number;
              }>;
            }>;
          }>;
        }>;
      }>;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

export class GoogleVisionService {
  private apiKey: string;
  private isAuthenticated: boolean = false;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_VISION_API_KEY || '';
    this.isAuthenticated = !!this.apiKey;
  }

  /**
   * Vérifie si le service est correctement configuré
   */
  isConfigured(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Extraire le texte d'une image (OCR)
   */
  async extractTextFromImage(imageBase64: string): Promise<{
    success: boolean;
    text?: string;
    confidence?: number;
    error?: string;
  }> {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Google Vision API non configurée');
      }

      const requestBody = {
        requests: [{
          image: {
            content: imageBase64.split(',')[1] // Enlever le préfixe data:image/...
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 10
            },
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ['fr', 'en'] // Support français et anglais
          }
        }]
      };

      const response = await fetch(`${VISION_API_ENDPOINT}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur API: ${errorData.error?.message || response.statusText}`);
      }

      const data: VisionResponse = await response.json();
      
      if (data.responses[0]?.error) {
        throw new Error(`Erreur Vision: ${data.responses[0].error.message}`);
      }

      // Extraire le texte détecté
      const textAnnotations = data.responses[0]?.textAnnotations || [];
      const fullText = data.responses[0]?.fullTextAnnotation?.text || '';
      
      // Utiliser le texte complet si disponible, sinon la première annotation
      const extractedText = fullText || textAnnotations[0]?.description || '';
      
      // Calculer la confiance moyenne
      let avgConfidence = 0;
      if (data.responses[0]?.fullTextAnnotation?.pages) {
        const symbols = data.responses[0].fullTextAnnotation.pages
          .flatMap(page => page.blocks || [])
          .flatMap(block => block.paragraphs || [])
          .flatMap(para => para.words || [])
          .flatMap(word => word.symbols || []);
        
        if (symbols.length > 0) {
          const totalConfidence = symbols.reduce((sum, symbol) => sum + (symbol.confidence || 0), 0);
          avgConfidence = totalConfidence / symbols.length;
        }
      }

      return {
        success: true,
        text: extractedText.trim(),
        confidence: avgConfidence
      };

    } catch (error) {
      console.error('Erreur extraction texte:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Détecter des documents médicaux spécifiques
   */
  async analyzeMedicalDocument(imageBase64: string): Promise<{
    success: boolean;
    documentType?: 'ordonnance' | 'resultat' | 'analyse' | 'autre';
    extractedData?: {
      patientName?: string;
      doctorName?: string;
      date?: string;
      medications?: string[];
      results?: string[];
    };
    error?: string;
  }> {
    try {
      const ocrResult = await this.extractTextFromImage(imageBase64);
      
      if (!ocrResult.success || !ocrResult.text) {
        throw new Error('Impossible d\'extraire le texte de l\'image');
      }

      const text = ocrResult.text.toLowerCase();
      
      // Détection du type de document
      let documentType: 'ordonnance' | 'resultat' | 'analyse' | 'autre' = 'autre';
      
      if (text.includes('ordonnance') || text.includes('prescription') || text.includes('médicament')) {
        documentType = 'ordonnance';
      } else if (text.includes('résultat') || text.includes('examen') || text.includes('analyse')) {
        documentType = 'resultat';
      } else if (text.includes('biologie') || text.includes('sang') || text.includes('laboratoire')) {
        documentType = 'analyse';
      }

      // Extraction des informations (version simplifiée)
      const extractedData = this.extractMedicalInfo(text);

      return {
        success: true,
        documentType,
        extractedData
      };

    } catch (error) {
      console.error('Erreur analyse document médical:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Extraire des informations médicales du texte
   */
  private extractMedicalInfo(text: string): {
    patientName?: string;
    doctorName?: string;
    date?: string;
    medications?: string[];
    results?: string[];
  } {
    const result: any = {};

    // Extraction du nom du patient (patterns communs)
    const patientPatterns = [
      /patient[:\s]+([A-Za-z\s]+)(?:\n|$)/i,
      /nom[:\s]+([A-Za-z\s]+)(?:\n|$)/i,
      /mr\s+([A-Za-z\s]+)(?:\n|$)/i,
      /mme\s+([A-Za-z\s]+)(?:\n|$)/i
    ];

    for (const pattern of patientPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.patientName = match[1].trim();
        break;
      }
    }

    // Extraction du nom du médecin
    const doctorPatterns = [
      /dr[:\s]+([A-Za-z\s]+)(?:\n|$)/i,
      /médecin[:\s]+([A-Za-z\s]+)(?:\n|$)/i,
      /docteur[:\s]+([A-Za-z\s]+)(?:\n|$)/i
    ];

    for (const pattern of doctorPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.doctorName = match[1].trim();
        break;
      }
    }

    // Extraction de la date
    const datePatterns = [
      /(\d{2}\/\d{2}\/\d{4})/,
      /(\d{2}-\d{2}-\d{4})/,
      /(\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.date = match[1].trim();
        break;
      }
    }

    // Extraction des médicaments (liste de mots communs)
    const medicationKeywords = ['mg', 'g', 'comprimé', 'capsule', 'sirop', 'gelule', 'cp', 'gél'];
    const lines = text.split('\n');
    result.medications = lines
      .filter(line => medicationKeywords.some(keyword => line.toLowerCase().includes(keyword)))
      .map(line => line.trim())
      .filter(line => line.length > 3);

    // Extraction des résultats (valeurs numériques avec unités)
    const resultPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:g\/l|mg\/l|ui\/l|mmol\/l|%)/gi,
      /(\d+(?:\.\d+)?)\s*(?:\/mm³|\/µl|\/ml)/gi
    ];

    result.results = [];
    for (const pattern of resultPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        result.results.push(...matches.map(m => m.trim()));
      }
    }

    return result;
  }

  /**
   * Convertir un fichier image en base64
   */
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export default GoogleVisionService;
