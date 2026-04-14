// =============================================
// O'CLIC SANTE — Décision Médecin (Accept / Reject)
// Injecte les boutons Accepter / Refuser sur les tickets
// WAITING dans la vue Consultation du médecin
// =============================================
(function () {
  'use strict';

  const POLL_INTERVAL = 3000;   // rafraîchit la liste toutes les 3s
  const DOCTOR_ROLES = ['DOCTOR', 'MEDECIN', 'PHYSICIAN'];

  // ---------- Utils ----------
  function getUser() {
    try {
      const raw = localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}';
      return JSON.parse(raw);
    } catch { return {}; }
  }
  function getToken() {
    return localStorage.getItem('oclic_sante_jwt_token') ||
           localStorage.getItem('token') || '';
  }
  function getCenterId() {
    try {
      const c = JSON.parse(localStorage.getItem('currentCenter') || '{}');
      return c?.id || 'center-001';
    } catch { return 'center-001'; }
  }
  function isDoctor() {
    const u = getUser();
    return DOCTOR_ROLES.includes(String(u.role || '').toUpperCase());
  }

  async function api(path, opts = {}) {
    const token = getToken();
    const centerId = getCenterId();
    const r = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'x-tenant-id': centerId
      },
      ...opts
    });
    const text = await r.text();
    try { return JSON.parse(text); } catch { return {}; }
  }

  // ---------- Decision logic ----------
  async function sendDecision(ticketId, decision, reason = null) {
    const user = getUser();
    const body = {
      decision,
      doctorId: user.id || null,
      doctorName: user.name || user.email || 'Médecin',
      rejectionReason: reason
    };
    return await api(`/api/tickets/${ticketId}/doctor-decision`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async function acceptTicket(ticketId, cardEl) {
    setCardLoading(cardEl, true);
    try {
      const result = await sendDecision(ticketId, 'accept');
      if (result.status === 'IN_PROGRESS' || result.decision === 'accepted') {
        showToast('✅ Consultation acceptée — ticket pris en charge', 'success');
        animateCardOut(cardEl, 'accept');
      } else {
        showToast('⚠️ Réponse inattendue: ' + JSON.stringify(result), 'warning');
        setCardLoading(cardEl, false);
      }
    } catch (e) {
      showToast('❌ Erreur: ' + e.message, 'error');
      setCardLoading(cardEl, false);
    }
  }

  async function rejectTicket(ticketId, patientName, cardEl) {
    const reason = await showRejectModal(patientName);
    if (reason === null) return; // annulé

    setCardLoading(cardEl, true);
    try {
      const result = await sendDecision(ticketId, 'reject', reason);
      if (result.status === 'REJECTED' || result.decision === 'rejected') {
        showToast(`🚫 Consultation de ${patientName} refusée`, 'info');
        animateCardOut(cardEl, 'reject');
      } else {
        showToast('⚠️ Réponse inattendue: ' + JSON.stringify(result), 'warning');
        setCardLoading(cardEl, false);
      }
    } catch (e) {
      showToast('❌ Erreur: ' + e.message, 'error');
      setCardLoading(cardEl, false);
    }
  }

  // ---------- DOM Injection ----------

  // Injecte les boutons sur chaque ticket WAITING visible
  function injectButtons() {
    if (!isDoctor()) return;

    // Les cartes de ticket dans la consultation — sélecteurs larges pour couvrir plusieurs frameworks
    const cards = document.querySelectorAll(
      '[data-ticket-id]:not([data-doctor-btns-injected]),' +
      '[data-id]:not([data-doctor-btns-injected]),' +
      '.ticket-card:not([data-doctor-btns-injected]),' +
      '.consultation-queue-item:not([data-doctor-btns-injected]),' +
      '.waiting-ticket:not([data-doctor-btns-injected])'
    );

    cards.forEach(card => {
      const statusEl = card.querySelector('[data-status],[class*="status"],[class*="badge"]');
      const statusText = (statusEl?.textContent || card.textContent || '').toUpperCase();

      // N'injecte que sur les tickets en attente
      if (!statusText.includes('WAITING') && !statusText.includes('WAIT') &&
          !statusText.includes('EN ATTENTE') && !statusText.includes('ATTENTE') &&
          !statusText.includes('PENDING')) {
        return;
      }

      const ticketId = card.dataset.ticketId || card.dataset.id ||
                       card.getAttribute('data-ticket-id') || card.getAttribute('data-id');
      const patientName = (
        card.querySelector('[data-patient],[class*="patient-name"],[class*="patientName"]')?.textContent ||
        card.querySelector('h3,h4,.name,.title')?.textContent ||
        'Patient'
      ).trim().slice(0, 40);

      if (!ticketId) return;

      card.setAttribute('data-doctor-btns-injected', '1');
      appendDecisionButtons(card, ticketId, patientName);
    });
  }

  function appendDecisionButtons(card, ticketId, patientName) {
    // Supprimer les anciens si présents (au cas où)
    const old = card.querySelector('.doctor-decision-bar');
    if (old) old.remove();

    const bar = document.createElement('div');
    bar.className = 'doctor-decision-bar';
    bar.style.cssText = [
      'display:flex', 'gap:8px', 'align-items:center', 'margin-top:10px',
      'padding:8px 12px', 'background:rgba(241,245,249,0.95)',
      'border-radius:8px', 'border:1px solid #e2e8f0',
      'animation:ddFadeIn 0.3s ease'
    ].join(';');

    bar.innerHTML = `
      <span style="font-size:11px;color:#64748b;flex:1;">👨‍⚕️ Décision médecin</span>
      <button class="dd-accept-btn" data-tid="${ticketId}" style="
        background:linear-gradient(135deg,#10b981,#059669);
        color:#fff;border:none;padding:6px 14px;border-radius:6px;
        cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:5px;
        box-shadow:0 2px 6px rgba(16,185,129,0.3);transition:transform 0.1s,box-shadow 0.1s;">
        ✅ Accepter
      </button>
      <button class="dd-reject-btn" data-tid="${ticketId}" data-name="${patientName}" style="
        background:linear-gradient(135deg,#ef4444,#dc2626);
        color:#fff;border:none;padding:6px 14px;border-radius:6px;
        cursor:pointer;font-size:12px;font-weight:600;display:flex;align-items:center;gap:5px;
        box-shadow:0 2px 6px rgba(239,68,68,0.3);transition:transform 0.1s,box-shadow 0.1s;">
        🚫 Refuser
      </button>`;

    card.appendChild(bar);

    bar.querySelector('.dd-accept-btn').addEventListener('click', () => acceptTicket(ticketId, card));
    bar.querySelector('.dd-reject-btn').addEventListener('click', () => rejectTicket(ticketId, patientName, card));

    // Hover effects
    bar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.04)'; btn.style.boxShadow = btn.classList.contains('dd-accept-btn') ? '0 4px 12px rgba(16,185,129,0.45)' : '0 4px 12px rgba(239,68,68,0.45)'; });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; btn.style.boxShadow = btn.classList.contains('dd-accept-btn') ? '0 2px 6px rgba(16,185,129,0.3)' : '0 2px 6px rgba(239,68,68,0.3)'; });
    });
  }

  function setCardLoading(card, loading) {
    const bar = card?.querySelector('.doctor-decision-bar');
    if (!bar) return;
    bar.querySelectorAll('button').forEach(b => {
      b.disabled = loading;
      b.style.opacity = loading ? '0.55' : '1';
      b.style.cursor = loading ? 'wait' : 'pointer';
    });
    if (loading) {
      let spinner = bar.querySelector('.dd-spinner');
      if (!spinner) {
        spinner = document.createElement('span');
        spinner.className = 'dd-spinner';
        spinner.style.cssText = 'font-size:14px;animation:ddSpin 1s linear infinite;display:inline-block;';
        spinner.textContent = '⏳';
        bar.appendChild(spinner);
      }
    } else {
      bar.querySelector('.dd-spinner')?.remove();
    }
  }

  function animateCardOut(card, type) {
    if (!card) return;
    card.style.transition = 'all 0.4s ease';
    card.style.opacity = '0';
    card.style.transform = type === 'accept' ? 'translateX(30px)' : 'translateX(-30px)';
    setTimeout(() => {
      if (card.parentNode) card.parentNode.removeChild(card);
    }, 420);
  }

  // ---------- Reject Modal ----------
  function showRejectModal(patientName) {
    return new Promise(resolve => {
      // Remove existing
      document.getElementById('dd-reject-modal-overlay')?.remove();

      const overlay = document.createElement('div');
      overlay.id = 'dd-reject-modal-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99998;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);animation:ddFadeIn 0.2s ease;';

      overlay.innerHTML = `
        <div id="dd-reject-modal" style="
          background:#fff;border-radius:16px;padding:28px;width:min(440px,92vw);
          box-shadow:0 24px 60px rgba(0,0,0,0.22);animation:ddSlideUp 0.25s ease;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <div style="width:40px;height:40px;background:#fee2e2;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">🚫</div>
            <div>
              <h3 style="margin:0;font-size:16px;color:#0f172a;font-weight:700;">Refus de consultation</h3>
              <p style="margin:2px 0 0 0;font-size:13px;color:#64748b;">Patient : <strong>${patientName}</strong></p>
            </div>
          </div>
          <label style="font-size:12px;font-weight:600;color:#374151;display:block;margin-bottom:6px;">
            Motif de refus <span style="color:#ef4444;">*</span>
          </label>
          <textarea id="dd-reason-input" placeholder="Ex: Patient orienté vers spécialiste, Consultation hors compétences, Urgence nécessitant transfert..." style="
            width:100%;height:90px;border:1px solid #e2e8f0;border-radius:8px;padding:10px;
            font-size:13px;resize:vertical;box-sizing:border-box;font-family:inherit;
            transition:border-color 0.2s;"></textarea>
          <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap;" id="dd-reason-shortcuts">
            <button class="dd-quick-reason" data-r="Patient orienté vers spécialiste" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;color:#475569;">↗ Vers spécialiste</button>
            <button class="dd-quick-reason" data-r="Consultation hors horaires d'ouverture" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;color:#475569;">🕐 Hors horaires</button>
            <button class="dd-quick-reason" data-r="Urgence — transfert vers hôpital" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;color:#475569;">🚑 Transfert urgences</button>
            <button class="dd-quick-reason" data-r="Dossier incomplet ou informations manquantes" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:4px 10px;font-size:11px;cursor:pointer;color:#475569;">📋 Dossier incomplet</button>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;">
            <button id="dd-cancel-reject" style="background:#f1f5f9;border:1px solid #e2e8f0;padding:9px 18px;border-radius:8px;cursor:pointer;font-size:13px;color:#475569;">Annuler</button>
            <button id="dd-confirm-reject" style="background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff;border:none;padding:9px 22px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;box-shadow:0 2px 8px rgba(239,68,68,0.3);">🚫 Confirmer le refus</button>
          </div>
        </div>`;

      document.body.appendChild(overlay);

      const textarea = overlay.querySelector('#dd-reason-input');
      textarea.focus();

      // Quick reason buttons
      overlay.querySelectorAll('.dd-quick-reason').forEach(btn => {
        btn.addEventListener('click', () => {
          textarea.value = btn.dataset.r;
          overlay.querySelectorAll('.dd-quick-reason').forEach(b => b.style.background = '#f1f5f9');
          btn.style.background = '#e0f2fe';
          btn.style.borderColor = '#0ea5e9';
          btn.style.color = '#0369a1';
        });
      });

      overlay.querySelector('#dd-cancel-reject').addEventListener('click', () => {
        overlay.remove();
        resolve(null);
      });

      overlay.querySelector('#dd-confirm-reject').addEventListener('click', () => {
        const reason = textarea.value.trim();
        if (!reason) {
          textarea.style.borderColor = '#ef4444';
          textarea.focus();
          return;
        }
        overlay.remove();
        resolve(reason);
      });

      overlay.addEventListener('click', e => {
        if (e.target === overlay) { overlay.remove(); resolve(null); }
      });

      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { overlay.remove(); resolve(null); document.removeEventListener('keydown', esc); }
      });
    });
  }

  // ---------- Toast ----------
  function showToast(msg, type = 'info') {
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed;bottom:76px;right:20px;z-index:99999;
      background:${colors[type] || colors.info};color:#fff;
      padding:12px 18px;border-radius:10px;font-size:13px;font-family:inherit;
      display:flex;align-items:center;gap:8px;
      box-shadow:0 6px 24px rgba(0,0,0,0.18);
      animation:ddFadeIn 0.25s ease;max-width:340px;line-height:1.4;`;
    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.4s'; setTimeout(() => toast.remove(), 400); }, 3500);
  }

  // ---------- CSS ----------
  function injectStyles() {
    if (document.getElementById('doctor-decision-styles')) return;
    const s = document.createElement('style');
    s.id = 'doctor-decision-styles';
    s.textContent = `
      @keyframes ddFadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes ddSlideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes ddSpin { to { transform:rotate(360deg); } }
      .doctor-decision-bar { user-select:none; }
      .doctor-decision-bar button:active { transform:scale(0.97) !important; }
    `;
    document.head.appendChild(s);
  }

  // ---------- Doctor Badge ----------
  function ensureDoctorBadge() {
    if (!isDoctor()) return;
    if (document.getElementById('dd-doctor-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'dd-doctor-badge';
    badge.style.cssText = `
      position:fixed;top:16px;right:16px;z-index:9999;
      background:linear-gradient(135deg,#0f172a,#1e3a5f);
      color:#fff;padding:8px 14px;border-radius:10px;
      font-size:12px;font-family:inherit;
      display:flex;align-items:center;gap:7px;
      box-shadow:0 4px 16px rgba(0,0,0,0.2);
      pointer-events:none;`;
    badge.innerHTML = `<span style="font-size:16px;">👨‍⚕️</span><span>Mode Médecin — Accepter / Refuser</span>`;
    document.body.appendChild(badge);
    setTimeout(() => { badge.style.opacity = '0'; badge.style.transition = 'opacity 0.5s'; setTimeout(() => badge.remove(), 500); }, 4000);
  }

  // ---------- Polling ----------
  let scanInterval = null;
  function startScanning() {
    if (!isDoctor()) {
      console.log('[DoctorDecision] Non-doctor session — module inactif');
      return;
    }
    injectStyles();
    ensureDoctorBadge();
    injectButtons();
    if (scanInterval) clearInterval(scanInterval);
    scanInterval = setInterval(injectButtons, POLL_INTERVAL);

    // MutationObserver pour détecter les nouveaux tickets sans polling
    if (window.MutationObserver) {
      const ob = new MutationObserver(() => injectButtons());
      ob.observe(document.body, { childList: true, subtree: true });
    }
    console.log('[DoctorDecision] ✅ Module décision médecin actif');
  }

  // ---------- Init ----------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startScanning);
  } else {
    startScanning();
  }

  // Re-scanner si navigation SPA
  window.addEventListener('hashchange', () => setTimeout(startScanning, 400));
  window.addEventListener('popstate', () => setTimeout(startScanning, 400));

  // Exposer pour debug
  window.OclicDoctorDecision = { accept: acceptTicket, reject: rejectTicket, scan: injectButtons };
})();
