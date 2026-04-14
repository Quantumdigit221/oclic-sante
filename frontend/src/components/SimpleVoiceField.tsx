import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface SimpleVoiceFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const SimpleVoiceField: React.FC<SimpleVoiceFieldProps> = ({ 
  value, 
  onChange, 
  placeholder = "Cliquez sur le micro pour parler...", 
  className = "",
  rows = 3
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Vérifier le support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.log('Speech recognition not supported in this browser');
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      recognition.timeout = 5000; // 5 secondes d'attente

      recognition.onresult = (event: any) => {
        console.log('Speech result received:', event);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            const transcript = result[0].transcript;
            console.log('Final transcript:', transcript);
            
            // Ajouter au texte existant
            const newValue = value + (value ? ' ' : '') + transcript;
            onChange(newValue);
            setIsListening(false);
            recognition.stop();
            break;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          console.log('No speech detected - try speaking louder or closer to microphone');
        } else if (event.error === 'not-allowed') {
          alert('Microphone non autorisé. Veuillez autoriser l\'accès au microphone.');
        } else if (event.error === 'network') {
          alert('Erreur réseau. Vérifiez votre connexion.');
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [value, onChange]);

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) {
      console.log('Speech not supported or not initialized');
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      console.log('Starting speech recognition');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none pr-12 ${
          isListening ? 'ring-2 ring-red-500 border-red-500' : ''
        }`}
      />
      
      {isSupported && (
        <button
          type="button"
          onClick={toggleListening}
          className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          title={isListening ? "Arrêter" : "Commencer"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      )}
      
      {!isSupported && (
        <div className="absolute top-2 right-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          Voice non supporté
        </div>
      )}
    </div>
  );
};
