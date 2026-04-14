import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Plus, Stethoscope, TestTube, FileText } from 'lucide-react';

interface PrescriptionsVoiceCommandProps {
  onPrescriptionAdd: (medicines: Array<{name: string, dosage: string, duration: string}>) => void;
  onExamAdd: (exams: Array<{name: string, type: string, urgency: string}>) => void;
  className?: string;
}

interface VoiceCommand {
  type: 'prescription' | 'exam';
  data: any;
}

export const PrescriptionsVoiceCommand: React.FC<PrescriptionsVoiceCommandProps> = ({
  onPrescriptionAdd,
  onExamAdd,
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("Prêt");
  const [processedCommands, setProcessedCommands] = useState<VoiceCommand[]>([]);
  const recognitionRef = useRef<any>(null);

  // Dictionnaire médical pour améliorer la reconnaissance
  const medicalKeywords = {
    medicines: [
      'paracétamol', 'ibuprofène', 'amoxicilline', 'aspirine', 'doliprane',
      'advil', 'augmentin', 'flagyl', 'artésunate', 'chloroquine',
      'vitamine c', 'zinc', 'dextrométhorphane', 'codéine'
    ],
    exams: [
      'bilan sanguin', 'numération formule sanguine', 'glycémie', 'créatinine',
      'radiographie', 'échographie', 'scanner', 'irm', 'électrocardiogramme',
      'test covid', 'test de grossesse', 'bilan hépatique', 'cholestérol'
    ],
    dosages: [
      '500mg', '1g', '250mg', '100mg', '50mg', '1 comprimé', '2 comprimés',
      '1 sachet', '1 ampoule', '5ml', '10ml', '1 gélule', '2 gélules'
    ],
    durations: [
      '7 jours', '10 jours', '14 jours', '3 jours', '5 jours', '21 jours',
      '1 semaine', '2 semaines', '1 mois', '3 mois', '6 mois'
    ],
    urgencies: [
      'urgent', 'normal', 'routine', 'en urgence', 'dans l\'heure', 'aujourd\'hui',
      'demain', 'cette semaine'
    ]
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported');
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';

      recognition.onstart = () => {
        setStatus("Écoute en cours...");
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setStatus(`Erreur: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setStatus("Prêt");
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Commandes d'ordonnances
    if (lowerText.includes('ordonnance') || lowerText.includes('prescrire') || lowerText.includes('médicament')) {
      const medicines = extractMedicines(text);
      if (medicines.length > 0) {
        const command: VoiceCommand = {
          type: 'prescription',
          data: medicines
        };
        setProcessedCommands(prev => [...prev, command]);
        onPrescriptionAdd(medicines);
        setStatus(`✅ ${medicines.length} médicament(s) ajouté(s)`);
      }
    }
    
    // Commandes d'examens
    if (lowerText.includes('examen') || lowerText.includes('bilan') || lowerText.includes('analyse')) {
      const exams = extractExams(text);
      if (exams.length > 0) {
        const command: VoiceCommand = {
          type: 'exam',
          data: exams
        };
        setProcessedCommands(prev => [...prev, command]);
        onExamAdd(exams);
        setStatus(`✅ ${exams.length} examen(s) ajouté(s)`);
      }
    }
  };

  const extractMedicines = (text: string) => {
    const medicines: Array<{name: string, dosage: string, duration: string}> = [];
    
    // Patterns pour extraire les médicaments
    const medicinePatterns = [
      /(\w+)\s+(\d+mg|\dg|\d+ comprimé|\d+ sachet|\d+ ampoule|\d+ml|\d+ gélule)/gi,
      /prescrire\s+(\w+)\s+(\d+mg|\dg|\d+ comprimé|\d+ sachet|\d+ ampoule|\d+ml|\d+ gélule)/gi,
      /donner\s+(\w+)\s+(\d+mg|\dg|\d+ comprimé|\d+ sachet|\d+ ampoule|\d+ml|\d+ gélule)/gi
    ];
    
    medicinePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        medicines.push({
          name: match[1],
          dosage: match[2],
          duration: extractDuration(text) || '7 jours'
        });
      }
    });
    
    return medicines;
  };

  const extractExams = (text: string) => {
    const exams: Array<{name: string, type: string, urgency: string}> = [];
    
    // Types d'examens reconnus
    const examTypes = {
      'sang': 'Laboratoire',
      'radiographie': 'Imagerie',
      'échographie': 'Imagerie',
      'scanner': 'Imagerie',
      'irm': 'Imagerie',
      'électrocardiogramme': 'Cardiologie',
      'test': 'Laboratoire',
      'bilan': 'Laboratoire'
    };
    
    // Extraire les examens
    Object.entries(examTypes).forEach(([keyword, type]) => {
      if (text.toLowerCase().includes(keyword)) {
        exams.push({
          name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
          type: type,
          urgency: extractUrgency(text) || 'normal'
        });
      }
    });
    
    return exams;
  };

  const extractDuration = (text: string) => {
    const durationPatterns = [
      /(\d+) jours/gi,
      /(\d+) semaine/gi,
      /(\d+) mois/gi
    ];
    
    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    return null;
  };

  const extractUrgency = (text: string) => {
    if (text.toLowerCase().includes('urgent')) return 'urgent';
    if (text.toLowerCase().includes('aujourd\'hui')) return 'aujourd\'hui';
    if (text.toLowerCase().includes('demain')) return 'demain';
    return 'normal';
  };

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setTranscript("");
      setProcessedCommands([]);
    }
  };

  if (!isSupported) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <p className="text-amber-800 text-sm">
          ⚠️ La reconnaissance vocale n'est pas supportée par votre navigateur.
          Utilisez Chrome ou Edge pour cette fonctionnalité.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-slate-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Mic className="w-5 h-5 text-teal-600" />
          Commandes Vocales Médicales
        </h3>
        <button
          onClick={toggleListening}
          className={`p-3 rounded-full transition-colors ${
            isListening 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
          <span>{status}</span>
        </div>

        {transcript && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-700 italic">"{transcript}"</p>
          </div>
        )}

        {processedCommands.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-900">Commandes traitées :</h4>
            {processedCommands.map((cmd, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-2">
                <div className="flex items-center gap-2 text-sm">
                  {cmd.type === 'prescription' ? (
                    <>
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-green-800">
                        Ordonnance : {cmd.data.length} médicament(s)
                      </span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-800">
                        Examens : {cmd.data.length} examen(s)
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-slate-50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-slate-900 mb-2">Exemples de commandes :</h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• "Prescrire du paracétamol 500mg pendant 7 jours"</li>
            <li>• "Ordonnance : ibuprofène 400mg et amoxicilline 1g"</li>
            <li>• "Demander un bilan sanguin et une radiographie"</li>
            <li>• "Examen urgent : glycémie et créatinine"</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
