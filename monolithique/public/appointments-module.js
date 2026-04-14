// =============================================
// O'CLIC SANTE - Module Rendez-vous (Appointments)
// Page complète avec prise de RDV, liste, SMS
// =============================================
(function () {
  'use strict';

  // ---- Config ----
  const BASE_URL = '';
  const ROUTE = '#/appointments';

  // ---- State ----
  let appointments = [];
  let patients = [];
  let doctors = [];
  let services = [];
  let filterDate = '';
  let filterStatus = 'all';
  let showForm = false;
  let editingId = null;
  let mounted = false;

  // ---- Init ----
  function init() {
    if (mounted) return;
    if (!window.location.hash.includes('/appointments')) return;
    mounted = true;
    renderPage();
    loadData();
  }

  // ---- Data ----
  async function api(path, opts = {}) {
    const token = localStorage.getItem('oclic_sante_jwt_token') ||
                  localStorage.getItem('token') || '';
    const center = JSON.parse(localStorage.getItem('currentCenter') || '{}');
    const centerId = center?.id || 'center-001';
    const r = await fetch(BASE_URL + path, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'x-tenant-id': centerId
      },
      ...opts
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  let insuranceCompanies = [];

  async function loadData() {
    try {
      [appointments, patients, doctors, services, insuranceCompanies] = await Promise.allSettled([
        api('/api/appointments'),
        api('/api/patients'),
        api('/api/users'),
        api('/api/services'),
        api('/api/insurance-companies')
      ]).then(results => results.map(r => r.status === 'fulfilled' ? (r.value || []) : []));
      doctors = doctors.filter(u => ['DOCTOR', 'doctor'].includes(String(u.role || '').toUpperCase()) || u.specialty);
    } catch (e) {
      console.error('[Appointments] Erreur chargement:', e);
    }
    renderList();
  }

  // ---- Render ----
  function renderPage(customRoot = null) {
    const root = customRoot || document.getElementById('appointments-injected-root');
    if (!root) return;
    root.innerHTML = buildPageHTML();
    attachEvents();
  }

  function buildPageHTML() {
    return `
      <div id="appt-container" style="display:flex;flex-direction:column;gap:24px;width:100%;font-family:ui-sans-serif, system-ui, -apple-system, sans-serif;">
        <div style="display:flex;flex-direction:column;gap:16px;margin-bottom:32px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
            <div>
              <h1 style="font-size:30px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;margin:0;">Gestion des Rendez-vous</h1>
              <p style="font-size:14px;color:#64748b;margin-top:4px;font-style:italic;font-weight:500;">Prise de RDV • SMS de confirmation • Rappels</p>
            </div>
            <div style="display:flex;gap:12px;">
               <button id="appt-refresh-btn" style="padding:10px 16px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;color:#64748b;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 1px 2px rgba(0,0,0,0.05);transition:background 0.2s;">
                 🔄 Actualiser
               </button>
               <button id="appt-new-btn" style="padding:10px 20px;background:#0d9488;border:none;border-radius:12px;color:#fff;font-weight:700;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 6px -1px rgba(13,148,136,0.2), 0 2px 4px -2px rgba(13,148,136,0.2);transition:background 0.2s;">
                 ➕ Nouveau RDV
               </button>
            </div>
          </div>
        </div>

        <!-- Filters bar -->
        <div style="background:#fff;padding:16px;border-radius:16px;border:1px solid #f1f5f9;box-shadow:0 1px 3px rgba(0,0,0,0.05);display:flex;flex-wrap:wrap;gap:16px;align-items:center;">
          <label style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:#475569;">
            📆 Date
            <input id="appt-filter-date" type="date" value="${filterDate}" style="border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;outline:none;font-size:14px;color:#334155;">
          </label>
          <label style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700;color:#475569;">
            Statut
            <select id="appt-filter-status" style="border:1px solid #e2e8f0;border-radius:8px;padding:6px 12px;outline:none;font-size:14px;color:#334155;">
              <option value="all" ${filterStatus==='all'?'selected':''}>Tous</option>
              <option value="SCHEDULED" ${filterStatus==='SCHEDULED'?'selected':''}>Programmé</option>
              <option value="COMPLETED" ${filterStatus==='COMPLETED'?'selected':''}>Terminé</option>
              <option value="CANCELLED" ${filterStatus==='CANCELLED'?'selected':''}>Annulé</option>
              <option value="NO_SHOW" ${filterStatus==='NO_SHOW'?'selected':''}>Absent</option>
            </select>
          </label>
          <span id="appt-count-badge" style="margin-left:auto;background:#f8fafc;color:#475569;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:700;"></span>
        </div>

        <!-- Main content -->
        <div id="appt-content-area" style="min-height:400px;margin-top:16px;">
          <div id="appt-list-area">
            <div style="display:flex;justify-content:center;padding:80px;">
               <div style="width:48px;height:48px;border-bottom:2px solid #14b8a6;border-radius:50%;animation:spin 1s linear infinite;"></div>
            </div>
          </div>
        </div>

        <!-- Modal Form -->
        <div id="appt-modal-overlay" style="position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(4px);z-index:9999;display:none;align-items:center;justify-content:center;padding:16px;">
          <div id="appt-modal" style="background:#fff;border-radius:16px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);width:100%;max-width:512px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
            <div style="padding:24px;border-bottom:1px solid #f8fafc;background:#f8fafc;display:flex;justify-content:space-between;align-items:center;">
              <h3 id="appt-modal-title" style="font-size:18px;font-weight:700;color:#0f172a;margin:0;">Nouveau Rendez-vous</h3>
              <button id="appt-close-modal" style="color:#94a3b8;background:none;border:none;font-size:24px;cursor:pointer;line-height:1;">&times;</button>
            </div>
            <div id="appt-form-content" style="overflow-y:auto;"></div>
          </div>
        </div>
      </div>
    `;
  }

  // ---- List rendering ----
  function renderList() {
    const area = document.getElementById('appt-list-area');
    if (!area) return;

    let filtered = appointments.filter(a => {
      if (filterDate && a.appointmentDate !== filterDate) return false;
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      return true;
    });

    const badge = document.getElementById('appt-count-badge');
    if (badge) badge.textContent = `${filtered.length} rendez-vous`;

    if (filtered.length === 0) {
      area.innerHTML = `<div style="background:#fff;border-radius:16px;padding:64px;text-align:center;color:#94a3b8;border:1px solid #f1f5f9;box-shadow:0 1px 2px rgba(0,0,0,0.05);">
        <div style="font-size:60px;margin-bottom:16px;">📭</div>
        <p style="font-size:18px;font-weight:500;color:#475569;margin:0;">Aucun rendez-vous ${filterDate ? 'pour cette date' : ''}</p>
        <p style="font-size:14px;margin-top:8px;">Cliquez sur <strong>+ Nouveau RDV</strong> pour commencer</p>
      </div>`;
      return;
    }

    area.innerHTML = `<div style="display:flex;flex-direction:column;gap:16px;">
      ${filtered.map(buildCard).join('')}
    </div>`;

    filtered.forEach(a => {
      const editBtn = document.getElementById(`appt-edit-${a.id}`);
      const cancelBtn = document.getElementById(`appt-cancel-${a.id}`);
      const completeBtn = document.getElementById(`appt-complete-${a.id}`);
      const smsBtn = document.getElementById(`appt-sms-${a.id}`);
      const deleteBtn = document.getElementById(`appt-delete-${a.id}`);

      if (editBtn) editBtn.onclick = () => openForm(a);
      if (cancelBtn) cancelBtn.onclick = () => updateStatus(a.id, 'CANCELLED');
      if (completeBtn) completeBtn.onclick = () => updateStatus(a.id, 'COMPLETED');
      if (smsBtn) smsBtn.onclick = () => sendReminder(a.id);
      if (deleteBtn) deleteBtn.onclick = () => deleteAppointment(a.id);
    });
  }

  function statusBadge(status) {
    const map = {
      SCHEDULED: ['#dbeafe', '#1d4ed8', '📅 Programmé'],
      COMPLETED: ['#dcfce7', '#15803d', '✅ Terminé'],
      CANCELLED: ['#fee2e2', '#b91c1c', '❌ Annulé'],
      NO_SHOW: ['#fef3c7', '#b45309', '👻 Absent']
    };
    const [bg, color, label] = map[status] || ['#f1f5f9', '#475569', status];
    return `<span style="background:${bg};color:${color};padding:4px 12px;border-radius:9999px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.5px;">${label}</span>`;
  }

  function buildCard(a) {
    const isScheduled = a.status === 'SCHEDULED';
    return `
    <div style="background:#fff;border-radius:16px;border:1px solid #f1f5f9;padding:20px;display:flex;flex-wrap:wrap;align-items:center;gap:20px;box-shadow:0 1px 3px rgba(0,0,0,0.05);transition:box-shadow 0.2s;">
      <!-- Date Block -->
      <div style="background:#f0fdfa;color:#0f766e;border-radius:12px;padding:12px;text-align:center;min-width:70px;flex-shrink:0;border:1px solid rgba(20,184,166,0.2);">
        <div style="font-size:24px;font-weight:900;line-height:1;">${a.appointmentDate ? a.appointmentDate.slice(8,10) : '--'}</div>
        <div style="font-size:10px;text-transform:uppercase;font-weight:700;opacity:0.8;margin-top:4px;">${formatMonth(a.appointmentDate)}</div>
        <div style="font-size:12px;font-weight:700;margin-top:4px;background:rgba(255,255,255,0.6);border-radius:4px;padding:0 4px;">${a.appointmentTime || ''}</div>
      </div>

      <!-- Info -->
      <div style="flex:1;min-width:200px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;flex-wrap:wrap;">
          <span style="font-size:18px;font-weight:800;color:#0f172a;">${esc(a.patientName)}</span>
          ${statusBadge(a.status)}
          ${a.smsSent ? '<span style="background:#ecfdf5;color:#059669;padding:2px 10px;border-radius:9999px;font-size:10px;font-weight:700;border:1px solid #d1fae5;">✉ SMS ✓</span>' : ''}
          ${a.reminderSent ? '<span style="background:#eff6ff;color:#2563eb;padding:2px 10px;border-radius:9999px;font-size:10px;font-weight:700;border:1px solid #dbeafe;">🔔 Rappel ✓</span>' : ''}
        </div>
        <div style="font-size:14px;font-weight:500;color:#64748b;display:flex;gap:16px;flex-wrap:wrap;">
          ${a.serviceName ? `<span style="display:flex;align-items:center;gap:4px;">🏥 <span style="color:#334155;">${esc(a.serviceName)}</span></span>` : ''}
          ${a.doctorName ? `<span style="display:flex;align-items:center;gap:4px;">👨‍⚕️ <span style="color:#334155;">Dr. ${esc(a.doctorName)}</span></span>` : ''}
          ${a.patientPhone ? `<span style="display:flex;align-items:center;gap:4px;">📞 <span style="color:#334155;">${esc(a.patientPhone)}</span></span>` : ''}
          ${a.durationMinutes ? `<span style="display:flex;align-items:center;gap:4px;">⏱ <span style="color:#334155;">${a.durationMinutes} min</span></span>` : ''}
        </div>
        ${a.notes ? `<div style="font-size:12px;color:#94a3b8;margin-top:12px;font-weight:500;background:#f8fafc;padding:8px;border-radius:8px;font-style:italic;">📝 ${esc(a.notes)}</div>` : ''}
        ${a.insuranceId ? `
          <div style="font-size:11px;margin-top:8px;display:flex;align-items:center;gap:6px;color:#0d9488;background:#f0fdfa;padding:4px 10px;border-radius:6px;width:fit-content;font-weight:700;border:1px solid rgba(13,148,136,0.1);">
            🛡️ PEC / IPM : <span style="font-weight:800;">${esc(a.claimReference || 'N/A')}</span>
          </div>
        ` : ''}
      </div>

      <!-- Actions -->
      <div style="display:flex;flex-wrap:wrap;gap:8px;flex-shrink:0;">
        ${isScheduled ? `
          <button id="appt-edit-${a.id}" style="padding:6px 12px;background:#f1f5f9;color:#475569;border-radius:8px;font-size:12px;font-weight:700;border:none;cursor:pointer;">✏️ Modifier</button>
          <button id="appt-complete-${a.id}" style="padding:6px 12px;background:#dcfce7;color:#15803d;border-radius:8px;font-size:12px;font-weight:700;border:none;cursor:pointer;">✅ Terminé</button>
          <button id="appt-cancel-${a.id}" style="padding:6px 12px;background:#fef2f2;color:#dc2626;border-radius:8px;font-size:12px;font-weight:700;border:none;cursor:pointer;">❌ Annuler</button>
          ${a.patientPhone ? `<button id="appt-sms-${a.id}" style="padding:6px 12px;background:#eff6ff;color:#2563eb;border-radius:8px;font-size:12px;font-weight:700;border:none;cursor:pointer;">📱 Rappel SMS</button>` : ''}
        ` : ''}
        <button id="appt-delete-${a.id}" style="padding:6px 12px;background:#f8fafc;color:#f43f5e;border-radius:8px;font-size:12px;font-weight:700;border:none;cursor:pointer;">🗑️ Supprimer</button>
      </div>
    </div>`;
  }

  function formatMonth(dateStr) {
    if (!dateStr) return '';
    const months = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];
    const m = parseInt(dateStr.slice(5, 7), 10);
    return months[m - 1] || '';
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ---- Form ----
  function openForm(existing = null) {
    editingId = existing ? existing.id : null;
    const modal = document.getElementById('appt-modal-overlay');
    const title = document.getElementById('appt-modal-title');
    const content = document.getElementById('appt-form-content');
    if (!modal || !content) return;

    title.textContent = existing ? 'Modifier le Rendez-vous' : 'Nouveau Rendez-vous';

    const patientOptions = patients.map(p =>
      `<option value="${p.id}" data-phone="${p.phone || p.patientPhone || ''}">${p.name || (p.firstName + ' ' + p.lastName)} ${p.phone ? '('+p.phone+')' : ''}</option>`
    ).join('');

    const doctorOptions = doctors.map(d =>
      `<option value="${d.id}" ${existing?.doctorId===d.id?'selected':''}>${d.name}${d.specialty?' – '+d.specialty:''}</option>`
    ).join('');

    const serviceOptions = services.map(s =>
      `<option value="${s.name}" ${existing?.serviceName===s.name?'selected':''}>${s.name}</option>`
    ).join('');

    const insuranceOptions = insuranceCompanies.map(ins =>
      `<option value="${ins.id}" ${String(existing?.insuranceId)===String(ins.id)?'selected':''}>${ins.name} (${ins.coverage_percentage}%)</option>`
    ).join('');

    content.innerHTML = `
    <form id="appt-form" style="padding:24px;display:flex;flex-direction:column;gap:16px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Patient *</label>
          <select id="appt-patient-select" style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;">
            <option value="">-- Sélectionner --</option>
            ${patientOptions}
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Nom manuel</label>
          <input id="appt-patient-name" type="text" value="${esc(existing?.patientName||'')}" placeholder="Nom complet" style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;box-sizing:border-box;">
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Téléphone (pour SMS)</label>
        <input id="appt-phone" type="tel" value="${esc(existing?.patientPhone||'')}" placeholder="ex: 0707070707" style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;box-sizing:border-box;">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Date du RDV *</label>
          <input id="appt-date" type="date" value="${existing?.appointmentDate||''}" required style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;box-sizing:border-box;color:#334155;">
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Heure *</label>
          <input id="appt-time" type="time" value="${existing?.appointmentTime||''}" required style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;box-sizing:border-box;color:#334155;">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Service</label>
          <select id="appt-service" style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;color:#334155;">
            <option value="Consultation">Consultation</option>
            <option value="Urgences">Urgences</option>
            ${serviceOptions}
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Médecin</label>
          <select id="appt-doctor" style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;color:#334155;">
            <option value="">-- Non défini --</option>
            ${doctorOptions}
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Durée (min)</label>
          <input id="appt-duration" type="number" value="${existing?.durationMinutes||30}" min="5" max="240" style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;color:#334155;box-sizing:border-box;">
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <label style="font-size:11px;font-weight:900;color:#94a3b8;letter-spacing:0.5px;text-transform:uppercase;">Notes</label>
        <textarea id="appt-notes" placeholder="Motif..." style="width:100%;padding:10px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;color:#334155;height:80px;resize:none;box-sizing:border-box;">${esc(existing?.notes||'')}</textarea>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;background:#f8fafc;padding:16px;border-radius:16px;border:1px solid #e2e8f0;">
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#0d9488;letter-spacing:0.5px;text-transform:uppercase;">Assurance / IPM (Optionnel)</label>
          <select id="appt-insurance" style="width:100%;padding:10px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;color:#334155;">
            <option value="">-- Sans Assurance --</option>
            ${insuranceOptions}
          </select>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="font-size:11px;font-weight:900;color:#0d9488;letter-spacing:0.5px;text-transform:uppercase;">N° PEC / Bon</label>
          <input id="appt-claim-ref" type="text" value="${esc(existing?.claimReference||'')}" placeholder="Ex: PEC-001" style="width:100%;padding:10px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;outline:none;font-size:14px;box-sizing:border-box;color:#334155;">
        </div>
      </div>
      <div style="background:#ecfdf5;border:1px solid #d1fae5;border-radius:12px;padding:12px;font-size:12px;font-weight:500;color:#047857;display:flex;align-items:center;gap:8px;">
        <span>📱</span> Un SMS de confirmation sera automatiquement envoyé si un numéro est renseigné.
      </div>
      <div style="padding-top:16px;display:flex;gap:12px;">
        <button type="button" id="appt-form-cancel" style="flex:1;padding:12px;background:#f1f5f9;color:#475569;border-radius:12px;font-weight:700;font-size:14px;border:none;cursor:pointer;">Annuler</button>
        <button type="submit" style="flex:1;padding:12px;background:#0d9488;color:#fff;border-radius:12px;font-weight:700;font-size:14px;border:none;cursor:pointer;box-shadow:0 4px 6px -1px rgba(13,148,136,0.3);">
          ${existing ? '💾 Enregistrer' : '📅 Créer le RDV'}
        </button>
      </div>
    </form>`;

    modal.style.display = 'flex';

    // Auto-fill phone from patient
    const patientSelect = document.getElementById('appt-patient-select');
    const phoneInput = document.getElementById('appt-phone');
    const nameInput = document.getElementById('appt-patient-name');
    if (patientSelect) {
      patientSelect.addEventListener('change', function () {
        const opt = this.options[this.selectedIndex];
        const phone = opt.getAttribute('data-phone') || '';
        if (phone && phoneInput) phoneInput.value = phone;
        if (nameInput && !nameInput.value) nameInput.value = opt.text.split(' (')[0];
      });
    }
    if (existing && patientSelect && existing.patientId) {
      patientSelect.value = existing.patientId;
    }

    document.getElementById('appt-form').addEventListener('submit', submitForm);
    document.getElementById('appt-form-cancel').onclick = closeModal;
  }

  async function submitForm(e) {
    e.preventDefault();
    const name = (document.getElementById('appt-patient-name')?.value || '').trim();
    const date = document.getElementById('appt-date')?.value;
    const time = document.getElementById('appt-time')?.value;
    if (!name || !date || !time) {
      alert('Veuillez remplir au minimum : Nom du patient, Date et Heure.');
      return;
    }

    const body = {
      patientName: name,
      patientId: document.getElementById('appt-patient-select')?.value || null,
      patientPhone: document.getElementById('appt-phone')?.value || null,
      appointmentDate: date,
      appointmentTime: time,
      serviceName: document.getElementById('appt-service')?.value || 'Consultation',
      doctorId: document.getElementById('appt-doctor')?.value || null,
      doctorName: (() => {
        const sel = document.getElementById('appt-doctor');
        const opt = sel?.options[sel?.selectedIndex];
        return opt && opt.value ? opt.text.split(' – ')[0] : '';
      })(),
      durationMinutes: parseInt(document.getElementById('appt-duration')?.value || '30'),
      notes: document.getElementById('appt-notes')?.value || '',
      insuranceId: document.getElementById('appt-insurance')?.value || null,
      claimReference: document.getElementById('appt-claim-ref')?.value || ''
    };

    const submitBtn = e.target.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Enregistrement...'; }

    try {
      let result;
      if (editingId) {
        result = await api(`/api/appointments/${editingId}`, { method: 'PATCH', body: JSON.stringify(body) });
        const idx = appointments.findIndex(a => a.id === editingId);
        if (idx >= 0) appointments[idx] = result;
      } else {
        result = await api('/api/appointments', { method: 'POST', body: JSON.stringify(body) });
        appointments.unshift(result);
      }
      closeModal();
      renderList();
    } catch (err) {
      alert('Erreur: ' + err.message);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = editingId ? '💾 Enregistrer' : '📅 Créer le RDV'; }
    }
  }

  function closeModal() {
    const modal = document.getElementById('appt-modal-overlay');
    if (modal) modal.style.display = 'none';
    editingId = null;
  }

  async function updateStatus(id, status) {
    const labels = { CANCELLED: 'Annuler ce rendez-vous', COMPLETED: 'Marquer comme terminé', NO_SHOW: 'Marquer comme absent' };
    if (!confirm(`${labels[status] || status} ?`)) return;
    try {
      const updated = await api(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      const idx = appointments.findIndex(a => a.id === id);
      if (idx >= 0) appointments[idx] = updated;
      renderList();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  }

  async function sendReminder(id) {
    const btn = document.getElementById(`appt-sms-${id}`);
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Envoi...'; }
    try {
      const res = await api(`/api/appointments/${id}/send-reminder`, { method: 'POST' });
      alert(res.success ? `✅ SMS de rappel envoyé !\n\nMessage: "${res.message}"` : '⚠️ SMS non envoyé: ' + res.smsResult?.error);
      if (res.success) {
        const idx = appointments.findIndex(a => a.id === id);
        if (idx >= 0) appointments[idx].reminderSent = true;
        renderList();
      }
    } catch (err) {
      alert('Erreur envoi SMS: ' + err.message);
    }
    if (btn) { btn.disabled = false; btn.textContent = '📱 Rappel SMS'; }
  }

  async function deleteAppointment(id) {
    if (!confirm('Supprimer définitivement ce rendez-vous ?')) return;
    try {
      await api(`/api/appointments/${id}`, { method: 'DELETE' });
      appointments = appointments.filter(a => a.id !== id);
      renderList();
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  }

  // ---- Events ----
  function attachEvents() {
    const newBtn = document.getElementById('appt-new-btn');
    const refreshBtn = document.getElementById('appt-refresh-btn');
    const overlay = document.getElementById('appt-modal-overlay');
    const closeBtn = document.getElementById('appt-close-modal');
    const filterDateEl = document.getElementById('appt-filter-date');
    const filterStatusEl = document.getElementById('appt-filter-status');

    if (newBtn) newBtn.onclick = () => openForm();
    if (refreshBtn) refreshBtn.onclick = () => { renderList(); loadData(); };
    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    if (filterDateEl) filterDateEl.addEventListener('change', e => { filterDate = e.target.value; renderList(); });
    if (filterStatusEl) filterStatusEl.addEventListener('change', e => { filterStatus = e.target.value; renderList(); });
  }

  // ---- Route detection ----
  let reactMainContent = null;

  function checkRoute() {
    if (!window.location.hash.includes('/appointments')) {
      cleanup();
      return;
    }
    setTimeout(renderHybrid, 100);
  }

  function cleanup() {
    let apptRoot = document.getElementById('appointments-injected-root');
    if (apptRoot) {
      apptRoot.remove();
    }
    if (reactMainContent) {
      Array.from(reactMainContent.children).forEach(child => {
        if (child.id !== 'appointments-injected-root') child.style.display = 'block';
      });
      reactMainContent = null;
    }
    mounted = false;
  }

  function renderHybrid() {
    if (mounted) return;
    
    // NUCLEAR OPTION: Hide everything that could overlap
    const hideCompetingContent = () => {
      // 1. Hide all main h1/h2 and their containers that are NOT inside our root
      document.querySelectorAll('h1, h2').forEach(header => {
        if (!header.closest('#appointments-injected-root')) {
          let container = header.parentElement;
          // Hide up to 3 levels of parents if they look like containers
          for(let i=0; i<3; i++) {
            if (container && container.tagName !== 'BODY' && container.tagName !== 'MAIN') {
              container.style.display = 'none';
              container = container.parentElement;
            }
          }
          header.style.display = 'none';
        }
      });

      // 2. Hide any other injected roots that might be active
      document.querySelectorAll('[id$="-injected-root"]').forEach(root => {
        if (root.id !== 'appointments-injected-root') {
          root.style.display = 'none';
        }
      });
    };
    
    // Find the main content area in the React app
    const target = document.querySelector('main .mx-auto') || 
                   document.querySelector('main') || 
                   document.querySelector('#root > div > div > main');
    
    if (!target) {
      setTimeout(renderHybrid, 200);
      return;
    }

    // Hide EVERYTHING inside target except our root
    Array.from(target.children).forEach(child => {
      if (child.id !== 'appointments-injected-root' && !child.tagName.toLowerCase().includes('nav')) {
        child.style.display = 'none';
        child.style.visibility = 'hidden'; // Double safety
      }
    });

    reactMainContent = target;

    let apptRoot = document.getElementById('appointments-injected-root');
    if (!apptRoot) {
      apptRoot = document.createElement('div');
      apptRoot.id = 'appointments-injected-root';
      apptRoot.className = 'w-full animate-in fade-in duration-500 relative z-50';
      target.appendChild(apptRoot);
    }
    
    apptRoot.style.display = 'block';
    apptRoot.style.visibility = 'visible';

    mounted = true;
    renderPage(apptRoot);
    loadData();
    
    // Run cleanup multiple times to catch React late renders
    hideCompetingContent();
    setTimeout(hideCompetingContent, 100);
    setTimeout(hideCompetingContent, 500);
    setTimeout(hideCompetingContent, 1500);
  }

  // Periodic cleanup if React Router re-renders the page content
  setInterval(() => {
    if (window.location.hash.includes('/appointments')) {
       // Make sure our root is visible and others are not
       if (reactMainContent) {
          Array.from(reactMainContent.children).forEach(child => {
            if (child.id !== 'appointments-injected-root' && child.tagName.toLowerCase() !== 'nav') {
              child.style.display = 'none';
            }
          });
       }
    }
  }, 2000);

  window.addEventListener('hashchange', checkRoute);
  window.addEventListener('popstate', checkRoute);
  document.addEventListener('DOMContentLoaded', checkRoute);
  
  checkRoute();

  // Export global API
  window.OclicAppointments = { init, loadData, renderList };
})();
