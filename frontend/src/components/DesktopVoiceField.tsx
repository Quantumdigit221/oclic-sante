import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface DesktopVoiceFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const DesktopVoiceField: React.FC<DesktopVoiceFieldProps> = ({ 
  value, 
  onChange, 
  placeholder = "Cliquez sur le micro ou utilisez Ctrl+Space...", 
  className = "",
  rows = 3
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState("");
  const [status, setStatus] = useState("Prêt");
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      console.log('Desktop speech recognition support:', {
        SpeechRecognition: !!SpeechRecognition,
        webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
        userAgent: navigator.userAgent,
        isSecure: location.protocol === 'https:'
      });
      
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported');
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      
      // Configuration optimisée pour desktop
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.maxAlternatives = 1;
      
      // Pas de timeout sur desktop - laisse l'utilisateur parler
      if ('timeout' in recognition) {
        delete (recognition as any).timeout;
      }

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setStatus("Écoute...");
        setIsListening(true);
        
        // Timeout de sécurité après 30 secondes
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 30000);
      };

      recognition.onresult = (event: any) => {
        console.log('Speech result:', event);
        
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          console.log('Result:', { transcript, confidence, isFinal: result.isFinal });
          
          if (result.isFinal) {
            finalTranscript = transcript;
            setStatus("Terminé");
          } else {
            interimTranscript = transcript;
            setStatus("Écoute...");
          }
        }

        if (finalTranscript) {
          // Ajouter le texte final
          const newValue = (value || '') + (value ? ' ' : '') + finalTranscript.trim();
          console.log('Adding text:', finalTranscript, 'New value:', newValue);
          console.log('Current value before change:', value);
          
          // Forcer la mise à jour
          setTimeout(() => {
            onChange(newValue);
            setInterimText("");
            console.log('Value changed to:', newValue);
          }, 100);
          
          // Arrêter après une phrase complète
          setTimeout(() => {
            if (recognitionRef.current) {
              recognitionRef.current.stop();
            }
          }, 1500);
        } else {
          setInterimText(interimTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setInterimText("");
        
        if (event.error === 'no-speech') {
          setStatus("Aucune parole détectée");
          console.log('No speech detected - please speak clearly');
        } else if (event.error === 'not-allowed') {
          setStatus("Microphone bloqué");
          alert('Microphone non autorisé. Cliquez sur l\'icône du microphone dans la barre d\'adresse et autorisez l\'accès.');
        } else if (event.error === 'network') {
          setStatus("Erreur réseau");
          alert('Erreur réseau. Vérifiez votre connexion internet.');
        } else {
          setStatus(`Erreur: ${event.error}`);
          alert(`Erreur de reconnaissance vocale: ${event.error}`);
        }
        
        // Nettoyer le timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
        setInterimText("");
        setStatus("Prêt");
        
        // Nettoyer le timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [value, onChange]);

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) {
      console.log('Speech not supported or not initialized');
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      recognitionRef.current.stop();
    } else {
      console.log('Starting speech recognition');
      setInterimText("");
      setStatus("Démarrage...");
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setStatus("Erreur de démarrage");
        setIsListening(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      toggleListening();
    }
  };

  const displayValue = value + (interimText ? (value ? ' ' : '') + interimText : '');
  
  // Debug
  console.log('DisplayValue:', displayValue, 'Value:', value, 'Interim:', interimText);

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none pr-12 ${
          isListening ? 'ring-2 ring-red-500 border-red-500 bg-red-50' : ''
        }`}
      />
      
      {isSupported && (
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-3 top-3 p-2 rounded-full transition-all transform ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse scale-110' 
              : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
          }`}
          title={isListening ? "Arrêter (Ctrl+Space)" : "Commencer (Ctrl+Space)"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
      
      {isListening && (
        <div className="absolute bottom-2 right-2 text-xs bg-white px-2 py-1 rounded shadow-sm border border-red-200">
          <span className="text-red-600 font-medium">{status}</span>
        </div>
      )}
      
      {!isSupported && (
        <div className="absolute top-2 right-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
          Voice non supporté
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 text-xs text-slate-400">
        Ctrl+Space
      </div>
    </div>
  );
};
