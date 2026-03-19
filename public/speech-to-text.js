// Patch pour ajouter la fonctionnalité Speech-to-Text aux champs du formulaire
(function() {
  'use strict';

  // Outil pour mettre à jour la valeur de manière compatible avec React
  function setReactInputValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (valueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Fonction pour initialiser l'API de reconnaissance vocale
  function startDictation(textarea, micBtn) {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("La reconnaissance vocale n'est pas supportée par votre navigateur (utilisez Chrome).");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    let isRecording = false;

    // Toggle logic
    if (textarea.recordingState === 'true') {
      // Arrêt demandé
      if (textarea.recognitionObj) textarea.recognitionObj.stop();
      return;
    }

    recognition.onstart = function() {
      isRecording = true;
      textarea.recordingState = 'true';
      micBtn.innerHTML = '🛑 Enregistrement...';
      micBtn.style.backgroundColor = '#ef4444'; // rouge
      micBtn.style.color = 'white';
      micBtn.classList.add('recording-pulse');
    };

    recognition.onresult = function(event) {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        const currentVal = textarea.value;
        const spacing = currentVal && !currentVal.endsWith(' ') && !currentVal.endsWith('\n') ? ' ' : '';
        const newText = currentVal + spacing + finalTranscript;
        
        // Mettre à jour avec compatibilité React
        setReactInputValue(textarea, newText);
      }
    };

    recognition.onerror = function(event) {
      console.error('Erreur reconnaissance vocale:', event.error);
      stopDictationUI();
    };

    recognition.onend = function() {
      stopDictationUI();
    };

    function stopDictationUI() {
      isRecording = false;
      textarea.recordingState = 'false';
      textarea.recognitionObj = null;
      micBtn.innerHTML = '🎤 Dictée Vocale';
      micBtn.style.backgroundColor = '#f1f5f9';
      micBtn.style.color = '#334155';
      micBtn.classList.remove('recording-pulse');
    }

    textarea.recognitionObj = recognition;
    recognition.start();
  }

  // Injecteur de boutton
  function injectMicButton(textarea) {
    if (textarea.dataset.hasMic) return;
    textarea.dataset.hasMic = 'true';

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'block';
    wrapper.style.marginBottom = '10px';

    // Remplacer text area par conteneur wrapper
    textarea.parentNode.insertBefore(wrapper, textarea);
    wrapper.appendChild(textarea);

    const micBtn = document.createElement('button');
    micBtn.type = 'button';
    micBtn.innerHTML = '🎤 Dictée Vocale';
    micBtn.style.position = 'absolute';
    micBtn.style.bottom = '10px';
    micBtn.style.right = '10px';
    micBtn.style.zIndex = '10';
    micBtn.style.border = '1px solid #cbd5e1';
    micBtn.style.borderRadius = '20px';
    micBtn.style.padding = '4px 10px';
    micBtn.style.fontSize = '12px';
    micBtn.style.backgroundColor = '#f1f5f9';
    micBtn.style.color = '#334155';
    micBtn.style.cursor = 'pointer';
    micBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    micBtn.style.transition = 'all 0.2s ease';

    // Animation style
    if (!document.getElementById('speech-styles')) {
      const style = document.createElement('style');
      style.id = 'speech-styles';
      style.innerHTML = `
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .recording-pulse { animation: pulse-red 2s infinite; }
      `;
      document.head.appendChild(style);
    }

    micBtn.onclick = function(e) {
      e.preventDefault();
      startDictation(textarea, micBtn);
    };

    wrapper.appendChild(micBtn);
    
    // Assurer qu'on laisse de la place en bas pour le bouton
    textarea.style.paddingBottom = '35px';
  }

  // Observer les ajouts dans le DOM pour trouver les champs correspondants
  const observer = new MutationObserver((mutations) => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      if (textarea.dataset.hasMic) return;

      const placeholder = (textarea.placeholder || '').toLowerCase();
      const parentHTML = textarea.parentElement ? textarea.parentElement.innerHTML.toLowerCase() : '';
      const prevElHTML = textarea.previousElementSibling ? textarea.previousElementSibling.innerHTML.toLowerCase() : '';

      // Détection des champs voulus
      const isSymptomes = placeholder.includes('décrire les symptômes') || parentHTML.includes('symptômes') || prevElHTML.includes('motif de consultation');
      const isDiagnostic = placeholder.includes('diagnostic provisoire') || parentHTML.includes('diagnostic') || prevElHTML.includes('diagnostic');
      const isNotes = placeholder.includes('notes cliniques') || parentHTML.includes('notes cliniques') || prevElHTML.includes('notes cliniques');

      if (isSymptomes || isDiagnostic || isNotes) {
        injectMicButton(textarea);
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
    console.log("Speech-to-text injector loaded.");
    
    // Intercepter les clics sur les boutons d'impression (s'ils ne marchent pas)
    document.addEventListener('click', (e) => {
      // Remonter l'arbre pour trouver si on a cliqué dans un bouton
      let target = e.target;
      while (target && target !== document) {
        if (target.tagName === 'BUTTON' || target.tagName === 'A') {
          const text = (target.innerText || target.textContent || '').toLowerCase();
          if (text.includes('imprimer') || text.includes('print')) {
            console.log("🛠️ Impression interceptée et forcée sans nouvel onglet !");
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            setTimeout(() => window.print(), 50);
            return false;
          }
        }
        target = target.parentElement;
      }
    }, true); // true = Intercepter AVANT que l'application React ne le détecte !

  });

})();
