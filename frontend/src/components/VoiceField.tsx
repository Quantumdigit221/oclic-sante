import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  language?: string;
  rows?: number;
  disabled?: boolean;
}

export const VoiceField: React.FC<VoiceFieldProps> = ({ 
  value, 
  onChange, 
  placeholder = "Parlez ou tapez ici...", 
  className = "",
  language = "fr-FR",
  rows = 3,
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      console.log('Checking speech recognition support:', {
        SpeechRecognition: !!SpeechRecognition,
        webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
        userAgent: navigator.userAgent
      });
      
      if (!SpeechRecognition) {
        console.error('Speech recognition not supported');
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        console.log('Speech recognition result:', event);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const transcriptConfidence = result[0].confidence || 0;
          
          console.log('Result:', { transcript, confidence: transcriptConfidence, isFinal: result.isFinal });
          
          if (result.isFinal) {
            setConfidence(transcriptConfidence);
            
            // Ajouter le texte final au champ
            const newValue = (value || '') + (value ? ' ' : '') + transcript.trim();
            console.log('Updating value:', newValue);
            onChange(newValue);
            setInterimText("");
            
            // Arrêter l'écoute après une phrase complète
            setTimeout(() => {
              if (recognitionRef.current) {
                recognitionRef.current.stop();
              }
            }, 100);
          } else {
            setInterimText(transcript);
            setConfidence(transcriptConfidence);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          setInterimText("");
          console.log('No speech detected');
        } else if (event.error === 'not-allowed') {
          console.error('Microphone access denied - please allow microphone access');
          alert('Veuillez autoriser l\'accès au microphone dans votre navigateur');
        } else if (event.error === 'network') {
          console.error('Network error - check internet connection');
          alert('Erreur réseau. Vérifiez votre connexion internet.');
        } else {
          console.error('Speech recognition error:', event.error);
          alert(`Erreur de reconnaissance vocale: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText("");
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, value, onChange]);

  const toggleListening = () => {
    console.log('Toggle listening called:', { isSupported, isListening, disabled });
    
    if (!isSupported) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur. Utilisez Chrome ou Edge.');
      return;
    }
    
    if (!recognitionRef.current) {
      console.error('Recognition not initialized');
      return;
    }
    
    if (disabled) {
      console.log('Field is disabled');
      return;
    }

    if (isListening) {
      console.log('Stopping recognition');
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText("");
    } else {
      console.log('Starting recognition');
      setInterimText("");
      setConfidence(0);
      
      try {
        recognitionRef.current.start();
        setIsListening(true);
        console.log('Recognition started successfully');
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setIsListening(false);
        alert('Échec du démarrage de la reconnaissance vocale');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl+Space pour activer/désactiver la voix
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      toggleListening();
    }
  };

  const displayValue = value + (interimText ? (value ? ' ' : '') + interimText : '');

  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={textareaRef}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none pr-12 ${
          disabled ? 'bg-slate-100 text-slate-500' : ''
        } ${isListening ? 'ring-2 ring-red-500 border-red-500' : ''}`}
      />
      
      {isSupported && !disabled && (
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
          }`}
          title={isListening ? "Arrêter l'enregistrement (Ctrl+Space)" : "Commencer l'enregistrement (Ctrl+Space)"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
      
      {isListening && (
        <div className="absolute bottom-2 right-2 text-xs text-slate-500 bg-white px-2 py-1 rounded shadow-sm">
          {confidence > 0 ? `Confiance: ${Math.round(confidence * 100)}%` : 'Écoute...'}
        </div>
      )}
      
      {!isSupported && (
        <div className="absolute top-2 right-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
          Voice non supporté
        </div>
      )}
    </div>
  );
};
