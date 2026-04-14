import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  language?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscript, 
  placeholder = "Cliquez sur le micro pour parler...", 
  className = "",
  language = "fr-FR"
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript = transcript;
            setTranscript(finalTranscript);
            setConfidence(confidence);
            
            // Envoyer le résultat final uniquement
            if (finalTranscript.trim() && confidence > 0.7) {
              onTranscript(finalTranscript.trim());
            }
          } else {
            interimTranscript = transcript;
            setTranscript(interimTranscript);
            setConfidence(confidence);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        
        if (event.error === 'no-speech') {
          // Ne pas afficher d'erreur pour no-speech, c'est normal
          setTranscript("");
        } else if (event.error === 'not-allowed') {
          setTranscript("Microphone non autorisé. Veuillez autoriser l'accès au microphone.");
          console.error('Microphone access denied');
        } else {
          setTranscript("Erreur de reconnaissance vocale. Veuillez réessayer.");
          console.error('Speech recognition error:', event.error);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Volume2 className="w-4 h-4 text-yellow-600" />
        <span className="text-sm text-yellow-800">
          La reconnaissance vocale n'est pas supportée par votre navigateur
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg ${className}`}>
      <button
        onClick={toggleListening}
        className={`p-3 rounded-full transition-colors ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
        title={isListening ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
      
      <div className="flex-1">
        {transcript ? (
          <div className="text-sm">
            <span className={`${
              confidence > 0.8 ? 'text-green-700' : 
              confidence > 0.6 ? 'text-yellow-700' : 
              'text-orange-700'
            }`}>{transcript}</span>
            {isListening && <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>}
            {isListening && confidence > 0 && (
              <div className="text-xs text-slate-500 mt-1">
                Confiance: {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        ) : (
          <span className="text-sm text-slate-500">{placeholder}</span>
        )}
      </div>
      
      {isListening && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-red-600 font-medium">Enregistrement...</span>
        </div>
      )}
    </div>
  );
};

// Hook pour la reconnaissance vocale
export const useVoiceInput = (language: string = "fr-FR") => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language;
        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  const startListening = (onResult: (text: string) => void) => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event: any) => {
      const finalTranscript = event.results[0][0].transcript;
      setTranscript(finalTranscript);
      onResult(finalTranscript);
      setIsListening(false);
    };

    recognitionRef.current.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported: !!recognitionRef.current
  };
};
