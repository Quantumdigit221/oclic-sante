import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface TestVoiceFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const TestVoiceField: React.FC<TestVoiceFieldProps> = ({ 
  value, 
  onChange, 
  placeholder = "Test speech-to-text...", 
  className = "",
  rows = 3
}) => {
  const [isListening, setIsListening] = useState(false);
  const [testText, setTestText] = useState("");

  const simulateSpeech = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTestText("Simulation de reconnaissance vocale...");
    
    // Simuler un délai de reconnaissance
    setTimeout(() => {
      const simulatedTexts = [
        "Le patient présente des symptômes de fièvre",
        "Le patient se plaint de maux de tête",
        "Le patient a une toux persistante",
        "Le patient présente des douleurs abdominales"
      ];
      
      const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
      const newValue = (value || '') + (value ? ' ' : '') + randomText;
      
      onChange(newValue);
      setTestText(`Texte ajouté: "${randomText}"`);
      setIsListening(false);
      
      // Effacer le message de test après 2 secondes
      setTimeout(() => setTestText(""), 2000);
    }, 2000);
  };

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none pr-12 ${
          isListening ? 'ring-2 ring-red-500 border-red-500 bg-red-50' : ''
        }`}
      />
      
      <button
        type="button"
        onClick={simulateSpeech}
        className={`absolute right-3 top-3 p-2 rounded-full transition-all transform ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse scale-110' 
            : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
        }`}
        title={isListening ? "Arrêter le test" : "Tester la reconnaissance vocale (simulation)"}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
      
      {isListening && (
        <div className="absolute bottom-2 right-2 text-xs bg-white px-2 py-1 rounded shadow-sm border border-red-200">
          <span className="text-red-600 font-medium">Test en cours...</span>
        </div>
      )}
      
      {testText && (
        <div className="absolute bottom-2 left-2 text-xs bg-green-50 px-2 py-1 rounded border border-green-200 text-green-700">
          {testText}
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 text-xs text-slate-400">
        Test Mode
      </div>
    </div>
  );
};
