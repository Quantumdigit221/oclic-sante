// Speech-to-text helper for consultation fields (React-compatible)
(function () {
  'use strict';

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn('[Speech] API not available in this browser.');
    return;
  }

  const FIELD_TAG = 'data-speech-enabled';
  const fieldModes = new WeakMap(); // element -> "replace" | "append"
  let activeSession = null;
  let lastFocusedField = null;
  let lastFocusedButton = null;
  let shortcutBadge = null;

  // ---------- UTILS ----------

  function normalize(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function setReactInputValue(element, value) {
    const descriptor = Object.getOwnPropertyDescriptor(element, 'value');
    const prototype = Object.getPrototypeOf(element);
    const prototypeDescriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    const setter = descriptor && descriptor.set ? descriptor.set : (prototypeDescriptor && prototypeDescriptor.set);
    if (setter) setter.call(element, value);
    else element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function appendTranscript(element, transcript) {
    const mode = fieldModes.get(element) || 'append';
    const clean = transcript.trim();
    if (!clean) return;
    if (mode === 'replace') { setReactInputValue(element, clean); return; }
    const current = String(element.value || '');
    const sep = current && !/\s$/.test(current) ? ' ' : '';
    setReactInputValue(element, current + sep + clean);
  }

  function findLabelForField(field) {
    const parent = field.parentElement;
    if (!parent) return null;
    const directLabel = parent.querySelector('label');
    if (directLabel) return directLabel;
    const prev = field.previousElementSibling;
    if (prev && prev.tagName === 'LABEL') return prev;
    return null;
  }

  // ---------- SESSION ----------

  function stopActiveSession() {
    if (!activeSession) return;
    try { activeSession.recognition.stop(); } catch (_) {}
    activeSession = null;
  }

  function updateButtonState(button, listening) {
    button.textContent = listening ? '⏹ Stop' : '🎤 Dictée';
    button.style.background = listening ? '#ef4444' : '#e2e8f0';
    button.style.color = listening ? '#ffffff' : '#0f172a';
    button.style.boxShadow = listening ? '0 0 0 3px rgba(239,68,68,0.3)' : 'none';
    button.style.animation = listening ? 'speech-pulse 1.2s ease-in-out infinite' : 'none';
  }

  function startDictation(target, button) {
    if (activeSession && activeSession.target === target) {
      stopActiveSession();
      updateButtonState(button, false);
      updateShortcutBadge(false);
      return;
    }
    if (activeSession) {
      updateButtonState(activeSession.button, false);
      stopActiveSession();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (event) {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) transcript += event.results[i][0].transcript + ' ';
      }
      appendTranscript(target, transcript);
    };

    recognition.onerror = function (event) {
      console.warn('[Speech] Error:', event.error);
      if (activeSession && activeSession.button === button) {
        updateButtonState(button, false);
        updateShortcutBadge(false);
        activeSession = null;
      }
    };

    recognition.onend = function () {
      if (activeSession && activeSession.button === button) {
        updateButtonState(button, false);
        updateShortcutBadge(false);
        activeSession = null;
      }
    };

    activeSession = { recognition, target, button };
    updateButtonState(button, true);
    updateShortcutBadge(true);
    recognition.start();
  }

  // ---------- BUTTON ----------

  function createMicButton(target) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '🎤 Dictée';
    button.style.cssText = 'margin-left:8px;padding:3px 10px;font-size:11px;border:1px solid #cbd5e1;border-radius:999px;cursor:pointer;background:#e2e8f0;color:#0f172a;transition:all 0.2s ease;';
    button.title = 'Démarrer la dictée vocale (raccourci : Ctrl+Espace)';
    button.addEventListener('click', function (ev) {
      ev.preventDefault();
      startDictation(target, button);
    });
    return button;
  }

  // ---------- FLOATING BADGE ----------

  function ensureBadge() {
    if (!shortcutBadge) {
      shortcutBadge = document.getElementById('speech-shortcut-badge');
    }
    if (!shortcutBadge) {
      shortcutBadge = document.createElement('div');
      shortcutBadge.id = 'speech-shortcut-badge';
      shortcutBadge.style.cssText = 'position:fixed;bottom:20px;right:20px;background:rgba(15,23,42,0.88);color:#f1f5f9;padding:8px 14px;border-radius:12px;font-size:12px;font-family:inherit;backdrop-filter:blur(8px);z-index:99999;pointer-events:none;opacity:0;transition:opacity 0.3s ease;display:flex;align-items:center;gap:6px;box-shadow:0 4px 16px rgba(0,0,0,0.25);';
      document.body.appendChild(shortcutBadge);
    }
    return shortcutBadge;
  }

  function setBadgeContent(html, bgColor, kbdStyle) {
    const badge = ensureBadge();
    badge.innerHTML = html;
    badge.style.background = bgColor;
    const kbd = badge.querySelector('kbd');
    if (kbd) kbd.style.cssText = kbdStyle;
    return badge;
  }

  const KBD_NORMAL = 'background:#1e293b;border:1px solid #475569;border-radius:4px;padding:1px 6px;font-family:monospace;font-size:11px;color:#94a3b8;';
  const KBD_ACTIVE = 'background:#991b1b;border:1px solid #b91c1c;border-radius:4px;padding:1px 6px;font-family:monospace;font-size:11px;color:#fecaca;';

  function updateShortcutBadge(listening) {
    if (listening) {
      const b = setBadgeContent('🔴 Dictée en cours... <kbd>Ctrl+Espace</kbd> pour arrêter', 'rgba(220,38,38,0.92)', KBD_ACTIVE);
      b.style.opacity = '1';
    } else {
      const b = ensureBadge();
      b.style.opacity = '0';
      setTimeout(() => {
        setBadgeContent('🎤 <kbd>Ctrl+Espace</kbd> pour dicter', 'rgba(15,23,42,0.88)', KBD_NORMAL);
      }, 300);
    }
  }

  function showHintBadge() {
    if (activeSession) return;
    const b = setBadgeContent('🎤 <kbd>Ctrl+Espace</kbd> pour dicter', 'rgba(15,23,42,0.88)', KBD_NORMAL);
    b.style.opacity = '1';
  }

  function hideHintBadge() {
    if (activeSession) return;
    const b = ensureBadge();
    b.style.opacity = '0';
  }

  // ---------- KEYBOARD SHORTCUT: Ctrl+Space ----------

  document.addEventListener('keydown', function (e) {
    if (e.code !== 'Space' || !e.ctrlKey) return;
    if (!lastFocusedField || !lastFocusedButton) return;
    e.preventDefault();
    startDictation(lastFocusedField, lastFocusedButton);
  }, true);

  // ---------- FOCUS TRACKING ----------

  document.addEventListener('focusin', function (e) {
    const target = e.target;
    if (target && target.getAttribute && target.getAttribute(FIELD_TAG) === '1') {
      lastFocusedField = target;
      const label = findLabelForField(target);
      if (label) {
        const btn = label.querySelector('button[data-speech-enabled-btn-for]') || label.querySelector('button');
        lastFocusedButton = btn || null;
      }
      showHintBadge();
    }
  });

  document.addEventListener('focusout', function (e) {
    const target = e.target;
    if (target && target.getAttribute && target.getAttribute(FIELD_TAG) === '1') {
      setTimeout(function () {
        const active = document.activeElement;
        if (!active || active.getAttribute(FIELD_TAG) !== '1') {
          lastFocusedField = null;
          lastFocusedButton = null;
          hideHintBadge();
        }
      }, 150);
    }
  });

  // ---------- CSS ANIMATION ----------

  const style = document.createElement('style');
  style.textContent = '@keyframes speech-pulse{0%,100%{box-shadow:0 0 0 3px rgba(239,68,68,0.3)}50%{box-shadow:0 0 0 7px rgba(239,68,68,0.08)}}';
  document.head.appendChild(style);

  // ---------- FIELD DETECTION ----------

  function classifyField(field) {
    const placeholder = normalize(field.getAttribute('placeholder'));
    const label = normalize(findLabelForField(field)?.textContent || '');
    const text = placeholder + ' ' + label;

    if (text.includes('temperature') || placeholder.includes('37')) return 'replace';
    if (text.includes('poids') || placeholder.includes('kg')) return 'replace';
    if (text.includes('tension') || placeholder.includes('120/80')) return 'replace';
    if (text.includes('pouls') || placeholder.includes('bpm')) return 'replace';

    if (text.includes('symptomes') || text.includes('motif de consultation')) return 'append';
    if (text.includes('diagnostic provisoire') || text === 'diagnostic') return 'append';
    if (text.includes('notes cliniques') || text.includes('observations supplementaires')) return 'append';

    return null;
  }

  function enableField(field) {
    if (!field || field.getAttribute(FIELD_TAG) === '1') return;
    const mode = classifyField(field);
    if (!mode) return;

    fieldModes.set(field, mode);
    field.setAttribute(FIELD_TAG, '1');

    const label = findLabelForField(field);
    if (!label) return;

    const btnKey = field.name || field.placeholder || mode;
    if (label.querySelector('[' + FIELD_TAG + '-btn-for="' + btnKey + '"]')) return;

    const button = createMicButton(field);
    button.setAttribute(FIELD_TAG + '-btn-for', btnKey);
    label.appendChild(button);
  }

  function scanAndAttach() {
    document.querySelectorAll('input[type="text"], textarea').forEach(enableField);
  }

  // ---------- INIT ----------

  const observer = new MutationObserver(scanAndAttach);
  document.addEventListener('DOMContentLoaded', function () {
    scanAndAttach();
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('[Speech] Dictée vocale activée — raccourci : Ctrl+Espace sur un champ de dictée.');
  });
})();
