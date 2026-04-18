/**
 * ============================================================
 * O'CLIC SANTE — MODULE ASSURANCES & IPM v2.0
 * Gestion complète : Compagnies, Couvertures, Réclamations
 * ============================================================
 */
(function() {
  'use strict';
  console.log('🛡️ INSURANCE MODULE v2.0: Initializing...');

  const API = '/api/insurance';
  let currentTab = 'dashboard';
  let companiesCache = [];
  let patientsCache = [];
  let coveragesCache = [];
  let transactionsCache = [];
  let statsCache = {};

  // ── Helpers ──
  function fmt(n) { return new Intl.NumberFormat('fr-FR').format(Math.round(n || 0)); }
  
  async function apiFetch(path, opts = {}) {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined
    });
    return res.json();
  }

  // ── Sidebar Navigation Injection ──
  function injectNavigation() {
    const maxAttempts = 30;
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (attempts > maxAttempts) { clearInterval(timer); return; }
      const sidebar = document.querySelector('nav, .sidebar, [class*="sidebar"], [class*="Sidebar"], aside');
      if (!sidebar) return;
      if (document.getElementById('ins-nav-injected')) { clearInterval(timer); return; }

      // Find menu container
      const menuContainer = sidebar.querySelector('ul, [class*="menu"], [class*="nav-list"]') || sidebar;
      const marker = document.createElement('div');
      marker.id = 'ins-nav-injected';
      marker.innerHTML = `
        <div style="margin:8px 12px;padding:0;border-top:1px solid rgba(255,255,255,0.08)"></div>
        <div style="padding:4px 16px;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.35);margin-bottom:2px">Assurances & IPM</div>
        <a href="#" id="ins-nav-dashboard" class="ins-nav-link" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;border-radius:8px;margin:2px 8px;transition:all .2s">
          <span style="font-size:16px">📊</span> Tableau de bord
        </a>
        <a href="#" id="ins-nav-companies" class="ins-nav-link" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;border-radius:8px;margin:2px 8px;transition:all .2s">
          <span style="font-size:16px">🏢</span> Compagnies
        </a>
        <a href="#" id="ins-nav-coverages" class="ins-nav-link" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;border-radius:8px;margin:2px 8px;transition:all .2s">
          <span style="font-size:16px">🛡️</span> Couvertures
        </a>
        <a href="#" id="ins-nav-claims" class="ins-nav-link" style="display:flex;align-items:center;gap:10px;padding:10px 16px;color:rgba(255,255,255,0.7);text-decoration:none;font-size:13px;border-radius:8px;margin:2px 8px;transition:all .2s">
          <span style="font-size:16px">📋</span> Réclamations
        </a>
      `;
      menuContainer.appendChild(marker);

      // Click handlers
      document.querySelectorAll('.ins-nav-link').forEach(link => {
        link.addEventListener('mouseenter', () => { link.style.background = 'rgba(99,102,241,0.15)'; link.style.color = '#fff'; });
        link.addEventListener('mouseleave', () => { if (!link.classList.contains('ins-active')) { link.style.background = 'transparent'; link.style.color = 'rgba(255,255,255,0.7)'; }});
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const tab = link.id.replace('ins-nav-', '');
          showInsuranceModule(tab);
        });
      });
      clearInterval(timer);
      console.log('🛡️ INSURANCE: Navigation injected');
    }, 800);
  }

  function setActiveNav(tab) {
    document.querySelectorAll('.ins-nav-link').forEach(l => {
      l.classList.remove('ins-active');
      l.style.background = 'transparent';
      l.style.color = 'rgba(255,255,255,0.7)';
    });
    const active = document.getElementById(`ins-nav-${tab}`);
    if (active) {
      active.classList.add('ins-active');
      active.style.background = 'rgba(99,102,241,0.2)';
      active.style.color = '#fff';
    }
  }

  // ── Main Module Display ──
  async function showInsuranceModule(tab = 'dashboard') {
    currentTab = tab;
    setActiveNav(tab);

    // Hide React app content, show insurance module
    const root = document.getElementById('root');
    let container = document.getElementById('ins-module-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'ins-module-root';
      root.parentElement.appendChild(container);
    }

    // Hide all root children except our module
    Array.from(root.children).forEach(c => c.style.display = 'none');
    container.style.display = 'block';

    container.innerHTML = `<div style="padding:24px;max-width:1400px;margin:0 auto;font-family:'Inter',sans-serif">
      <div id="ins-content" style="min-height:70vh">
        <div style="display:flex;align-items:center;justify-content:center;padding:60px"><div class="ins-spinner"></div></div>
      </div>
    </div>
    <style>
      .ins-spinner{width:40px;height:40px;border:3px solid rgba(99,102,241,0.2);border-top-color:#6366f1;border-radius:50%;animation:ins-spin .7s linear infinite}
      @keyframes ins-spin{to{transform:rotate(360deg)}}
      .ins-card{background:rgba(30,30,50,0.6);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.06);border-radius:16px;padding:24px;transition:all .3s}
      .ins-card:hover{border-color:rgba(99,102,241,0.3);box-shadow:0 8px 32px rgba(99,102,241,0.08)}
      .ins-btn{padding:10px 20px;border:none;border-radius:10px;font-weight:600;cursor:pointer;font-size:13px;transition:all .25s;font-family:'Inter',sans-serif}
      .ins-btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff}
      .ins-btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(99,102,241,0.4)}
      .ins-btn-danger{background:linear-gradient(135deg,#ef4444,#dc2626);color:#fff}
      .ins-btn-success{background:linear-gradient(135deg,#10b981,#059669);color:#fff}
      .ins-btn-outline{background:transparent;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.8)}
      .ins-btn-outline:hover{border-color:#6366f1;color:#a5b4fc}
      .ins-input{width:100%;padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:13px;font-family:'Inter',sans-serif;outline:none;transition:border .2s}
      .ins-input:focus{border-color:#6366f1}
      .ins-select{width:100%;padding:10px 14px;background:rgba(15,15,30,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#fff;font-size:13px;font-family:'Inter',sans-serif;outline:none}
      .ins-table{width:100%;border-collapse:separate;border-spacing:0}
      .ins-table th{text-align:left;padding:12px 16px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.4);border-bottom:1px solid rgba(255,255,255,0.06)}
      .ins-table td{padding:12px 16px;font-size:13px;color:rgba(255,255,255,0.8);border-bottom:1px solid rgba(255,255,255,0.04)}
      .ins-table tr:hover td{background:rgba(99,102,241,0.04)}
      .ins-badge{display:inline-block;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600}
      .ins-badge-active{background:rgba(16,185,129,0.15);color:#34d399}
      .ins-badge-pending{background:rgba(251,191,36,0.15);color:#fbbf24}
      .ins-badge-paid{background:rgba(59,130,246,0.15);color:#60a5fa}
      .ins-badge-rejected{background:rgba(239,68,68,0.15);color:#f87171}
      .ins-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:10000;display:flex;align-items:center;justify-content:center}
      .ins-modal{background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;max-width:560px;width:90%;max-height:85vh;overflow-y:auto}
      .ins-stat-card{text-align:center;padding:20px}
      .ins-stat-value{font-size:28px;font-weight:700;background:linear-gradient(135deg,#a5b4fc,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
      .ins-stat-label{font-size:12px;color:rgba(255,255,255,0.45);margin-top:6px;text-transform:uppercase;letter-spacing:0.5px}
      .ins-tabs{display:flex;gap:4px;background:rgba(255,255,255,0.03);border-radius:12px;padding:4px;margin-bottom:24px}
      .ins-tab{flex:1;padding:10px;text-align:center;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:rgba(255,255,255,0.5);transition:all .2s}
      .ins-tab.active{background:rgba(99,102,241,0.2);color:#a5b4fc}
      .ins-tab:hover:not(.active){background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.7)}
      .ins-label{display:block;font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:6px;font-weight:500}
      .ins-form-group{margin-bottom:16px}
    </style>`;

    // Load data
    try {
      const [stats, companies, patients, transactions] = await Promise.all([
        apiFetch('/stats'),
        apiFetch('/companies'),
        apiFetch('/patients'),
        apiFetch('/transactions')
      ]);
      statsCache = stats;
      companiesCache = Array.isArray(companies) ? companies : [];
      coveragesCache = Array.isArray(patients) ? patients : [];
      transactionsCache = Array.isArray(transactions) ? transactions : [];

      // Load patients list for forms
      try {
        const pRes = await fetch('/api/patients');
        const pData = await pRes.json();
        patientsCache = Array.isArray(pData) ? pData : [];
      } catch(e) { patientsCache = []; }

    } catch(e) {
      console.error('[INSURANCE] Data load error:', e);
    }

    renderTab(tab);
  }

  function renderTab(tab) {
    const content = document.getElementById('ins-content');
    if (!content) return;
    switch(tab) {
      case 'dashboard': renderDashboard(content); break;
      case 'companies': renderCompanies(content); break;
      case 'coverages': renderCoverages(content); break;
      case 'claims': renderClaims(content); break;
    }
  }

  // ── Dashboard ──
  function renderDashboard(el) {
    const s = statsCache;
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:28px">
        <div>
          <h1 style="font-size:24px;font-weight:700;color:#fff;margin:0">📊 Assurances & IPM</h1>
          <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:4px 0 0">Vue d'ensemble du module assurance</p>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:32px">
        <div class="ins-card ins-stat-card"><div class="ins-stat-value">${s.totalCompanies || 0}</div><div class="ins-stat-label">Compagnies actives</div></div>
        <div class="ins-card ins-stat-card"><div class="ins-stat-value">${s.totalCoveredPatients || 0}</div><div class="ins-stat-label">Patients couverts</div></div>
        <div class="ins-card ins-stat-card"><div class="ins-stat-value">${s.totalClaims || 0}</div><div class="ins-stat-label">Total réclamations</div></div>
        <div class="ins-card ins-stat-card"><div class="ins-stat-value" style="background:linear-gradient(135deg,#fbbf24,#f59e0b);-webkit-background-clip:text">${s.pendingClaims || 0}</div><div class="ins-stat-label">En attente</div></div>
        <div class="ins-card ins-stat-card"><div class="ins-stat-value" style="background:linear-gradient(135deg,#34d399,#10b981);-webkit-background-clip:text">${fmt(s.paidCoverageAmount)} F</div><div class="ins-stat-label">Montant payé</div></div>
        <div class="ins-card ins-stat-card"><div class="ins-stat-value" style="background:linear-gradient(135deg,#f87171,#ef4444);-webkit-background-clip:text">${fmt(s.pendingCoverageAmount)} F</div><div class="ins-stat-label">En attente paiement</div></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div class="ins-card">
          <h3 style="color:#fff;font-size:15px;margin:0 0 16px">🏢 Dernières compagnies</h3>
          ${companiesCache.length === 0 ? '<p style="color:rgba(255,255,255,0.3);font-size:13px">Aucune compagnie enregistrée</p>' :
            companiesCache.slice(0,5).map(c => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                <div><span style="font-weight:500;color:#fff">${c.name}</span> <span class="ins-badge ${c.is_active ? 'ins-badge-active' : 'ins-badge-rejected'}">${c.is_active ? 'Actif' : 'Inactif'}</span></div>
                <span style="color:rgba(255,255,255,0.4);font-size:12px">${c.type || 'ASSURANCE'}</span>
              </div>`).join('')}
        </div>
        <div class="ins-card">
          <h3 style="color:#fff;font-size:15px;margin:0 0 16px">📋 Dernières réclamations</h3>
          ${transactionsCache.length === 0 ? '<p style="color:rgba(255,255,255,0.3);font-size:13px">Aucune réclamation</p>' :
            transactionsCache.slice(0,5).map(t => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04)">
                <div><span style="color:#fff;font-size:13px">${t.patient_name || 'Patient'}</span></div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span style="color:rgba(255,255,255,0.5);font-size:12px">${fmt(t.insurance_coverage_amount)} F</span>
                  <span class="ins-badge ins-badge-${(t.status||'PENDING').toLowerCase()}">${t.status}</span>
                </div>
              </div>`).join('')}
        </div>
      </div>`;
  }

  // ── Companies ──
  function renderCompanies(el) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
        <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0">🏢 Compagnies d'assurance</h1>
        <button class="ins-btn ins-btn-primary" id="ins-add-company">+ Nouvelle compagnie</button>
      </div>
      <div class="ins-card" style="padding:0;overflow:hidden">
        <table class="ins-table">
          <thead><tr><th>Nom</th><th>Code</th><th>Type</th><th>Couverture %</th><th>Plafond</th><th>Contact</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            ${companiesCache.length === 0 ? '<tr><td colspan="8" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3)">Aucune compagnie enregistrée</td></tr>' :
              companiesCache.map(c => `<tr>
                <td style="font-weight:500;color:#fff">${c.name}</td>
                <td>${c.code || '—'}</td>
                <td><span class="ins-badge" style="background:rgba(99,102,241,0.12);color:#a5b4fc">${c.type || 'ASSURANCE'}</span></td>
                <td>${c.coverage_percentage || 100}%</td>
                <td>${fmt(c.max_coverage_amount)} F</td>
                <td>${c.contact_person || '—'}</td>
                <td><span class="ins-badge ${c.is_active ? 'ins-badge-active' : 'ins-badge-rejected'}">${c.is_active ? 'Actif' : 'Inactif'}</span></td>
                <td>
                  <button class="ins-btn ins-btn-outline" style="padding:6px 12px;font-size:11px" onclick="window._insEditCompany(${c.id})">✏️</button>
                  <button class="ins-btn ins-btn-danger" style="padding:6px 12px;font-size:11px" onclick="window._insDeleteCompany(${c.id})">🗑️</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    document.getElementById('ins-add-company').addEventListener('click', () => showCompanyModal());
  }

  function showCompanyModal(company = null) {
    const isEdit = !!company;
    const overlay = document.createElement('div');
    overlay.className = 'ins-modal-overlay';
    overlay.innerHTML = `
      <div class="ins-modal">
        <h2 style="color:#fff;margin:0 0 20px;font-size:18px">${isEdit ? '✏️ Modifier' : '➕ Nouvelle'} compagnie</h2>
        <div class="ins-form-group"><label class="ins-label">Nom *</label><input class="ins-input" id="ins-co-name" value="${company?.name||''}"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="ins-form-group"><label class="ins-label">Code</label><input class="ins-input" id="ins-co-code" value="${company?.code||''}"></div>
          <div class="ins-form-group"><label class="ins-label">Type</label>
            <select class="ins-select" id="ins-co-type"><option value="ASSURANCE" ${company?.type==='ASSURANCE'?'selected':''}>Assurance</option><option value="IPM" ${company?.type==='IPM'?'selected':''}>IPM</option><option value="MUTUELLE" ${company?.type==='MUTUELLE'?'selected':''}>Mutuelle</option></select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="ins-form-group"><label class="ins-label">Couverture %</label><input class="ins-input" type="number" id="ins-co-coverage" value="${company?.coverage_percentage||100}" min="0" max="100"></div>
          <div class="ins-form-group"><label class="ins-label">Plafond (FCFA)</label><input class="ins-input" type="number" id="ins-co-max" value="${company?.max_coverage_amount||0}"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="ins-form-group"><label class="ins-label">Téléphone</label><input class="ins-input" id="ins-co-phone" value="${company?.phone||''}"></div>
          <div class="ins-form-group"><label class="ins-label">Email</label><input class="ins-input" id="ins-co-email" value="${company?.email||''}"></div>
        </div>
        <div class="ins-form-group"><label class="ins-label">Personne de contact</label><input class="ins-input" id="ins-co-contact" value="${company?.contact_person||''}"></div>
        <div class="ins-form-group"><label class="ins-label">Adresse</label><input class="ins-input" id="ins-co-address" value="${company?.address||''}"></div>
        <div style="display:flex;gap:12px;margin-top:24px">
          <button class="ins-btn ins-btn-primary" id="ins-co-save" style="flex:1">${isEdit ? 'Mettre à jour' : 'Créer'}</button>
          <button class="ins-btn ins-btn-outline" id="ins-co-cancel">Annuler</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#ins-co-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#ins-co-save').addEventListener('click', async () => {
      const data = {
        name: document.getElementById('ins-co-name').value.trim(),
        code: document.getElementById('ins-co-code').value.trim(),
        type: document.getElementById('ins-co-type').value,
        coverage_percentage: parseFloat(document.getElementById('ins-co-coverage').value) || 100,
        max_coverage_amount: parseFloat(document.getElementById('ins-co-max').value) || 0,
        phone: document.getElementById('ins-co-phone').value.trim(),
        email: document.getElementById('ins-co-email').value.trim(),
        contact_person: document.getElementById('ins-co-contact').value.trim(),
        address: document.getElementById('ins-co-address').value.trim(),
        is_active: 1
      };
      if (!data.name) return alert('Le nom est requis');
      try {
        if (isEdit) await apiFetch(`/companies/${company.id}`, { method: 'PUT', body: data });
        else await apiFetch('/companies', { method: 'POST', body: data });
        overlay.remove();
        showInsuranceModule('companies');
      } catch(e) { alert('Erreur: ' + e.message); }
    });
  }

  window._insEditCompany = (id) => {
    const c = companiesCache.find(x => x.id === id);
    if (c) showCompanyModal(c);
  };
  window._insDeleteCompany = async (id) => {
    if (!confirm('Supprimer cette compagnie ?')) return;
    await apiFetch(`/companies/${id}`, { method: 'DELETE' });
    showInsuranceModule('companies');
  };

  // ── Coverages ──
  function renderCoverages(el) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
        <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0">🛡️ Couvertures patients</h1>
        <button class="ins-btn ins-btn-primary" id="ins-add-coverage">+ Nouvelle couverture</button>
      </div>
      <div class="ins-card" style="padding:0;overflow:hidden">
        <table class="ins-table">
          <thead><tr><th>Patient</th><th>Compagnie</th><th>N° Police</th><th>N° Membre</th><th>Couverture</th><th>Validité</th><th>Actions</th></tr></thead>
          <tbody>
            ${coveragesCache.length === 0 ? '<tr><td colspan="7" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3)">Aucune couverture enregistrée</td></tr>' :
              coveragesCache.map(c => `<tr>
                <td style="font-weight:500;color:#fff">${c.patient_name || c.patient_id}</td>
                <td>${c.company_name || '—'}</td>
                <td>${c.policy_number || '—'}</td>
                <td>${c.member_number || '—'}</td>
                <td>${c.coverage_percentage || '—'}%</td>
                <td style="font-size:12px">${c.valid_from ? new Date(c.valid_from).toLocaleDateString('fr') : '—'} → ${c.valid_until ? new Date(c.valid_until).toLocaleDateString('fr') : '—'}</td>
                <td><button class="ins-btn ins-btn-danger" style="padding:6px 12px;font-size:11px" onclick="window._insDeleteCoverage(${c.id})">🗑️</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    document.getElementById('ins-add-coverage').addEventListener('click', () => showCoverageModal());
  }

  function showCoverageModal() {
    const overlay = document.createElement('div');
    overlay.className = 'ins-modal-overlay';
    overlay.innerHTML = `
      <div class="ins-modal">
        <h2 style="color:#fff;margin:0 0 20px;font-size:18px">➕ Nouvelle couverture patient</h2>
        <div class="ins-form-group"><label class="ins-label">Patient *</label>
          <select class="ins-select" id="ins-cv-patient"><option value="">— Sélectionner —</option>${patientsCache.map(p => `<option value="${p.id}">${p.name||p.patientName||p.firstName||'Patient'}</option>`).join('')}</select>
        </div>
        <div class="ins-form-group"><label class="ins-label">Compagnie *</label>
          <select class="ins-select" id="ins-cv-company"><option value="">— Sélectionner —</option>${companiesCache.map(c => `<option value="${c.id}">${c.name} (${c.type})</option>`).join('')}</select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="ins-form-group"><label class="ins-label">N° Police</label><input class="ins-input" id="ins-cv-policy"></div>
          <div class="ins-form-group"><label class="ins-label">N° Membre</label><input class="ins-input" id="ins-cv-member"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="ins-form-group"><label class="ins-label">Couverture %</label><input class="ins-input" type="number" id="ins-cv-pct" value="80"></div>
          <div class="ins-form-group"><label class="ins-label">Plafond (FCFA)</label><input class="ins-input" type="number" id="ins-cv-max" value="0"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="ins-form-group"><label class="ins-label">Valide du</label><input class="ins-input" type="date" id="ins-cv-from"></div>
          <div class="ins-form-group"><label class="ins-label">Valide au</label><input class="ins-input" type="date" id="ins-cv-until"></div>
        </div>
        <div style="display:flex;gap:12px;margin-top:24px">
          <button class="ins-btn ins-btn-primary" id="ins-cv-save" style="flex:1">Enregistrer</button>
          <button class="ins-btn ins-btn-outline" id="ins-cv-cancel">Annuler</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#ins-cv-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#ins-cv-save').addEventListener('click', async () => {
      const data = {
        patient_id: document.getElementById('ins-cv-patient').value,
        insurance_company_id: parseInt(document.getElementById('ins-cv-company').value),
        policy_number: document.getElementById('ins-cv-policy').value.trim(),
        member_number: document.getElementById('ins-cv-member').value.trim(),
        coverage_percentage: parseFloat(document.getElementById('ins-cv-pct').value) || 80,
        max_coverage_amount: parseFloat(document.getElementById('ins-cv-max').value) || 0,
        is_primary: 1,
        valid_from: document.getElementById('ins-cv-from').value || null,
        valid_until: document.getElementById('ins-cv-until').value || null
      };
      if (!data.patient_id || !data.insurance_company_id) return alert('Patient et compagnie requis');
      try {
        await apiFetch('/patients', { method: 'POST', body: data });
        overlay.remove();
        showInsuranceModule('coverages');
      } catch(e) { alert('Erreur: ' + e.message); }
    });
  }

  window._insDeleteCoverage = async (id) => {
    if (!confirm('Supprimer cette couverture ?')) return;
    await apiFetch(`/patients/${id}`, { method: 'DELETE' });
    showInsuranceModule('coverages');
  };

  // ── Claims / Transactions ──
  function renderClaims(el) {
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
        <h1 style="font-size:22px;font-weight:700;color:#fff;margin:0">📋 Réclamations assurance</h1>
        <button class="ins-btn ins-btn-primary" id="ins-add-claim">+ Nouvelle réclamation</button>
      </div>
      <div class="ins-card" style="padding:0;overflow:hidden">
        <table class="ins-table">
          <thead><tr><th>Réf.</th><th>Patient</th><th>Compagnie</th><th>Montant total</th><th>Part assurance</th><th>Part patient</th><th>Date</th><th>Statut</th><th>Actions</th></tr></thead>
          <tbody>
            ${transactionsCache.length === 0 ? '<tr><td colspan="9" style="text-align:center;padding:40px;color:rgba(255,255,255,0.3)">Aucune réclamation</td></tr>' :
              transactionsCache.map(t => `<tr>
                <td style="font-family:monospace;font-size:12px;color:#a5b4fc">${t.claim_reference || '—'}</td>
                <td style="font-weight:500;color:#fff">${t.patient_name || '—'}</td>
                <td>${t.company_name || '—'}</td>
                <td>${fmt(t.total_amount)} F</td>
                <td style="color:#34d399">${fmt(t.insurance_coverage_amount)} F</td>
                <td>${fmt(t.patient_paid_amount)} F</td>
                <td style="font-size:12px">${t.claim_date ? new Date(t.claim_date).toLocaleDateString('fr') : '—'}</td>
                <td><span class="ins-badge ins-badge-${(t.status||'pending').toLowerCase()}">${t.status}</span></td>
                <td>
                  ${t.status === 'PENDING' ? `<button class="ins-btn ins-btn-success" style="padding:5px 10px;font-size:10px" onclick="window._insApproveClaim(${t.id})">✅ Approuver</button>` : ''}
                  ${t.status === 'APPROVED' ? `<button class="ins-btn ins-btn-primary" style="padding:5px 10px;font-size:10px" onclick="window._insPayClaim(${t.id})">💰 Payer</button>` : ''}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
    document.getElementById('ins-add-claim').addEventListener('click', () => showClaimModal());
  }

  function showClaimModal() {
    const overlay = document.createElement('div');
    overlay.className = 'ins-modal-overlay';
    overlay.innerHTML = `
      <div class="ins-modal">
        <h2 style="color:#fff;margin:0 0 20px;font-size:18px">➕ Nouvelle réclamation</h2>
        <div class="ins-form-group"><label class="ins-label">Patient *</label>
          <select class="ins-select" id="ins-cl-patient"><option value="">— Sélectionner —</option>${patientsCache.map(p => `<option value="${p.id}">${p.name||p.patientName||'Patient'}</option>`).join('')}</select>
        </div>
        <div class="ins-form-group"><label class="ins-label">Compagnie *</label>
          <select class="ins-select" id="ins-cl-company"><option value="">— Sélectionner —</option>${companiesCache.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div class="ins-form-group"><label class="ins-label">Montant total</label><input class="ins-input" type="number" id="ins-cl-total" value="0"></div>
          <div class="ins-form-group"><label class="ins-label">Part assurance</label><input class="ins-input" type="number" id="ins-cl-ins" value="0"></div>
          <div class="ins-form-group"><label class="ins-label">Part patient</label><input class="ins-input" type="number" id="ins-cl-pat" value="0"></div>
        </div>
        <div class="ins-form-group"><label class="ins-label">Notes</label><input class="ins-input" id="ins-cl-notes" placeholder="Notes ou justification"></div>
        <div style="display:flex;gap:12px;margin-top:24px">
          <button class="ins-btn ins-btn-primary" id="ins-cl-save" style="flex:1">Soumettre la réclamation</button>
          <button class="ins-btn ins-btn-outline" id="ins-cl-cancel">Annuler</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#ins-cl-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Auto-calc
    const totalEl = overlay.querySelector('#ins-cl-total');
    const companyEl = overlay.querySelector('#ins-cl-company');
    totalEl.addEventListener('input', () => {
      const total = parseFloat(totalEl.value) || 0;
      const cId = parseInt(companyEl.value);
      const company = companiesCache.find(x => x.id === cId);
      const pct = company ? (company.coverage_percentage || 80) : 80;
      overlay.querySelector('#ins-cl-ins').value = Math.round(total * pct / 100);
      overlay.querySelector('#ins-cl-pat').value = Math.round(total * (100 - pct) / 100);
    });

    overlay.querySelector('#ins-cl-save').addEventListener('click', async () => {
      const data = {
        patient_id: document.getElementById('ins-cl-patient').value,
        insurance_company_id: parseInt(document.getElementById('ins-cl-company').value),
        total_amount: parseFloat(document.getElementById('ins-cl-total').value) || 0,
        insurance_coverage_amount: parseFloat(document.getElementById('ins-cl-ins').value) || 0,
        patient_paid_amount: parseFloat(document.getElementById('ins-cl-pat').value) || 0,
        remaining_amount: 0,
        status: 'PENDING',
        notes: document.getElementById('ins-cl-notes').value.trim()
      };
      if (!data.patient_id || !data.insurance_company_id) return alert('Patient et compagnie requis');
      try {
        await apiFetch('/transactions', { method: 'POST', body: data });
        overlay.remove();
        showInsuranceModule('claims');
      } catch(e) { alert('Erreur: ' + e.message); }
    });
  }

  window._insApproveClaim = async (id) => {
    await apiFetch(`/transactions/${id}`, { method: 'PATCH', body: { status: 'APPROVED' } });
    showInsuranceModule('claims');
  };
  window._insPayClaim = async (id) => {
    const today = new Date().toISOString().split('T')[0];
    await apiFetch(`/transactions/${id}`, { method: 'PATCH', body: { status: 'PAID', payment_date: today } });
    showInsuranceModule('claims');
  };

  // ── Expose for sidebar restoration ──
  window._showInsuranceModule = showInsuranceModule;

  // ── Restore React content when non-insurance nav is clicked ──
  const observer = new MutationObserver(() => {
    const insRoot = document.getElementById('ins-module-root');
    if (!insRoot || insRoot.style.display === 'none') return;
    // Check if user navigated away from insurance (React re-rendered)
    const root = document.getElementById('root');
    if (root) {
      const hasVisibleChildren = Array.from(root.children).some(c => c.style.display !== 'none' && c.offsetHeight > 0);
      if (hasVisibleChildren && insRoot.style.display === 'block') {
        // User navigated away — hide insurance module
        insRoot.style.display = 'none';
      }
    }
  });
  setTimeout(() => {
    const root = document.getElementById('root');
    if (root) observer.observe(root, { childList: true, subtree: false });
  }, 3000);

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavigation);
  } else {
    injectNavigation();
  }

  console.log('🛡️ INSURANCE MODULE v2.0: Ready');
})();
