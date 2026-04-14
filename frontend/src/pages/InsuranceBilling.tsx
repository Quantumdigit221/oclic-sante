import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { 
  Shield, 
  Users, 
  FileText, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  DollarSign,
  Calendar,
  Search
} from 'lucide-react';

interface InsuranceCompany {
  id: number;
  name: string;
  code: string;
  type: 'IPM' | 'ASSURANCE' | 'AUTRE';
  phone: string;
  email: string;
  address: string;
  contact_person: string;
  coverage_percentage: number;
  max_coverage_amount: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PatientInsurance {
  id: number;
  patient_id: number;
  insurance_company_id: number;
  policy_number: string;
  member_number: string;
  coverage_percentage: number;
  max_coverage_amount: number;
  is_primary: boolean;
  valid_from: string;
  valid_until: string;
  insurance_company?: InsuranceCompany;
}

interface InsuranceTransaction {
  id: number;
  patient_id: number;
  invoice_id: number;
  service_id: number;
  consultation_id: number;
  total_amount: number;
  patient_paid_amount: number;
  insurance_coverage_amount: number;
  remaining_amount: number;
  insurance_company_id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'PARTIAL';
  claim_reference: string;
  claim_date: string;
  payment_date: string;
  notes: string;
  insurance_company?: InsuranceCompany;
  patient?: any;
}

interface TariffRow {
  name: string;
  category: string;
  amount: number;
}

export const InsuranceBilling: React.FC = () => {
  const { 
    patients, 
    services, 
    consultations, 
    createInsuranceCompany,
    updateInsuranceCompany,
    deleteInsuranceCompany,
    createPatientInsurance,
    updatePatientInsurance,
    deletePatientInsurance,
    createInsuranceTransaction,
    updateInsuranceTransaction,
    insuranceCompanies,
    patientInsurances,
    insuranceTransactions
  } = useStore();

  // Vérifications de sécurité
  const insuranceCompaniesList = Array.isArray(insuranceCompanies) ? insuranceCompanies : [];
  const insuranceTransactionsList = Array.isArray(insuranceTransactions) ? insuranceTransactions : [];
  const patientInsurancesList = Array.isArray(patientInsurances) ? patientInsurances : [];

  const [activeTab, setActiveTab] = useState<'billing' | 'companies' | 'patients'>('billing');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showPatientInsuranceModal, setShowPatientInsuranceModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [editingPatientInsurance, setEditingPatientInsurance] = useState<PatientInsurance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tariffRows, setTariffRows] = useState<TariffRow[]>([]);
  const [appliedPricingLabel, setAppliedPricingLabel] = useState('Tarif manuel');

  const toAmount = (value: any): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    code: '',
    type: 'ASSURANCE' as 'IPM' | 'ASSURANCE' | 'AUTRE',
    phone: '',
    email: '',
    address: '',
    contact_person: '',
    coverage_percentage: 100,
    max_coverage_amount: 0,
    is_active: true
  });

  const [billingForm, setBillingForm] = useState({
    patient_id: '0',
    insurance_company_id: 0,
    service_id: '0',
    consultation_id: '0',
    total_amount: 0,
    patient_paid_amount: 0,
    insurance_coverage_amount: 0,
    insurance_coverage_percentage: 100,
    claim_reference: '',
    notes: ''
  });

  // Calcul des statistiques
  const stats = {
    totalCompanies: insuranceCompaniesList.length,
    activeCompanies: insuranceCompaniesList.filter(c => c.is_active).length,
    totalTransactions: insuranceTransactionsList.length,
    pendingTransactions: insuranceTransactionsList.filter(t => t.status === 'PENDING').length,
    totalCoverageAmount: insuranceTransactionsList.reduce((sum, t) => sum + toAmount(t.insurance_coverage_amount), 0) || 0,
    totalPatientResponsibility: insuranceTransactionsList.reduce((sum, t) => sum + toAmount(t.patient_paid_amount), 0) || 0
  };

  // Filtrage
  const filteredCompanies = insuranceCompaniesList.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = insuranceTransactionsList.filter(transaction => {
    const name = transaction.patient?.name || '';
    const compName = transaction.insurance_company?.name || '';
    return !searchTerm || 
      transaction.claim_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSaveCompany = async () => {
    try {
      if (editingCompany) {
        await updateInsuranceCompany(editingCompany.id, companyForm);
      } else {
        await createInsuranceCompany(companyForm);
      }
      setShowCompanyModal(false);
      setEditingCompany(null);
      resetCompanyForm();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      name: '',
      code: '',
      type: 'ASSURANCE',
      phone: '',
      email: '',
      address: '',
      contact_person: '',
      coverage_percentage: 100,
      max_coverage_amount: 0,
      is_active: true
    });
  };

  const handleEditCompany = (company: InsuranceCompany) => {
    setEditingCompany(company);
    setCompanyForm(company as any);
    setShowCompanyModal(true);
  };

  const handleDeleteCompany = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette compagnie ?')) {
      await deleteInsuranceCompany(id);
    }
  };

  const handleCreateBilling = async () => {
    try {
      const insuranceCoverage = (billingForm.total_amount * billingForm.insurance_coverage_percentage) / 100;
      const patientResponsibility = billingForm.total_amount - insuranceCoverage;
      
      await createInsuranceTransaction({
        ...billingForm,
        insurance_coverage_amount: insuranceCoverage,
        patient_paid_amount: patientResponsibility,
        remaining_amount: 0,
        status: 'PENDING',
        claim_date: new Date().toISOString().split('T')[0]
      });
      
      setShowBillingModal(false);
      resetBillingForm();
    } catch (error) {
      console.error('Error creating billing:', error);
    }
  };

  const resetBillingForm = () => {
    setBillingForm({
      patient_id: '0',
      insurance_company_id: 0,
      service_id: '0',
      consultation_id: '0',
      total_amount: 0,
      patient_paid_amount: 0,
      insurance_coverage_amount: 0,
      insurance_coverage_percentage: 100,
      claim_reference: '',
      notes: ''
    });
    setAppliedPricingLabel('Tarif manuel');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-50';
      case 'APPROVED': return 'text-blue-600 bg-blue-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'PARTIAL': return 'text-orange-600 bg-orange-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const calculateInsuranceCoverage = (totalAmount: number, coveragePercentage: number) => {
    return (totalAmount * coveragePercentage) / 100;
  };

  const selectedService = useMemo(
    () => services?.find((service: any) => String(service.id) === String(billingForm.service_id)),
    [services, billingForm.service_id]
  );

  const selectedCompany = useMemo(
    () => insuranceCompanies?.find((company: any) => Number(company.id) === Number(billingForm.insurance_company_id)),
    [insuranceCompanies, billingForm.insurance_company_id]
  );

  const normalizeText = (value?: string): string =>
    (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase();

  const getPatientDisplayName = (patient: any): string => {
    if (!patient) return '';
    return patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.code || `Patient #${patient.id}`;
  };

  const parseCsvLine = (line: string): string[] => {
    const cols: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        cols.push(current);
        current = '';
      } else current += ch;
    }
    cols.push(current);
    return cols.map((c) => c.trim());
  };

  useEffect(() => {
    let mounted = true;
    const loadTariffs = async () => {
      try {
        const response = await fetch('/tarifs/liste-details-frais.csv');
        if (!response.ok) return;
        const csvText = await response.text();
        const lines = csvText.split(/\r?\n/).filter(Boolean);
        const rows: TariffRow[] = [];
        for (let i = 1; i < lines.length; i += 1) {
          const cols = parseCsvLine(lines[i]);
          if (cols.length < 6) continue;
          rows.push({ name: cols[0], category: cols[1], amount: parseFloat(cols[5].replace(/\s/g, '')) || 0 });
        }
        if (mounted) setTariffRows(rows);
      } catch (e) { console.error(e); }
    };
    loadTariffs();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedService) return;
    const serviceName = normalizeText(selectedService.name);
    const companyType = normalizeText(selectedCompany?.type || 'AUTRE');
    const isAssurance = companyType.includes('ASSURANCE');
    const isIpm = companyType.includes('IPM') || companyType.includes('IMP');

    let finalPrice = Number(selectedService.price || 0);
    let label = 'Tarif normal';

    const candidates = tariffRows.filter(r => normalizeText(r.name).includes(serviceName) || serviceName.includes(normalizeText(r.name)));
    if (candidates.length > 0) {
      const aRow = candidates.find(r => isAssurance && normalizeText(r.category).includes('ASSURANCE'));
      const iRow = candidates.find(r => isIpm && (normalizeText(r.category).includes('IPM') || normalizeText(r.category).includes('IMP')));
      if (isAssurance && aRow) { finalPrice = aRow.amount; label = 'Tarif assurance'; }
      else if (isIpm && iRow) { finalPrice = iRow.amount; label = 'Tarif IPM'; }
    }

    const cov = calculateInsuranceCoverage(finalPrice, billingForm.insurance_coverage_percentage);
    setAppliedPricingLabel(label);
    setBillingForm(p => ({ ...p, total_amount: finalPrice, insurance_coverage_amount: cov, patient_paid_amount: finalPrice - cov }));
  }, [selectedService, selectedCompany, tariffRows, billingForm.insurance_coverage_percentage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-600" />
            Facturation Assurance & IPM
          </h2>
          <p className="text-sm text-slate-500">Gestion des facturations et remboursements</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Compagnies', val: stats.totalCompanies, icon: Shield, color: 'text-teal-600' },
          { label: 'Transactions', val: stats.totalTransactions, icon: FileText, color: 'text-blue-600' },
          { label: 'En Attente', val: stats.pendingTransactions, icon: Calendar, color: 'text-yellow-600' },
          { label: 'Total Couverture', val: `${stats.totalCoverageAmount.toLocaleString()} FCFA`, icon: DollarSign, color: 'text-green-600' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div><p className="text-sm text-slate-500">{s.label}</p><p className="text-2xl font-bold text-slate-900">{s.val}</p></div>
            <s.icon className={`w-8 h-8 ${s.color}`} />
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { id: 'billing', label: 'Facturation', icon: FileText },
            { id: 'companies', label: 'Compagnies', icon: Shield },
            { id: 'patients', label: 'Patients', icon: Users }
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === t.id ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setShowBillingModal(true)} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium hover:bg-teal-700">
              <Plus className="w-4 h-4" /> Nouvelle Transaction
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr><th className="px-6 py-4">Date</th><th className="px-6 py-4">Patient</th><th className="px-6 py-4">Compagnie</th><th className="px-6 py-4">Total</th><th className="px-6 py-4 text-center">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(t.created_at || t.claim_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{getPatientDisplayName(t.patient)}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.insurance_company?.name || 'N/A'}</td>
                    <td className="px-6 py-4 font-bold text-teal-700">{t.total_amount.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-center"><span className={`px-2 py-1 text-[10px] font-black rounded-full uppercase ${getStatusColor(t.status)}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => { setEditingCompany(null); resetCompanyForm(); setShowCompanyModal(true); }} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"> <Plus className="w-4 h-4" /> Ajouter Compagnie</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCompanies.map(c => (
              <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-teal-500 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-xl font-bold">{c.name[0]}</div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditCompany(c)} className="p-1.5 text-slate-400 hover:text-teal-600"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteCompany(c.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900">{c.name}</h3>
                <p className="text-slate-500 text-sm">{c.email || c.address || 'Pas de contact'}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
                  <span className="text-slate-400">Couverture</span><span className="font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">{c.coverage_percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={() => setShowPatientInsuranceModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"> <Plus className="w-4 h-4" /> Lier Patient</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr><th className="px-6 py-4">Patient</th><th className="px-6 py-4">Compagnie</th><th className="px-6 py-4">N° Police</th><th className="px-6 py-4 text-center">Taux</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {patientInsurancesList.map(p => {
                  const patient = patients?.find(pt => String(pt.id) === String(p.patient_id));
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-bold text-slate-900">{getPatientDisplayName(patient)}</td>
                      <td className="px-6 py-4 text-slate-600">{insuranceCompaniesList.find(c => c.id === p.insurance_company_id)?.name || 'Inconnue'}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">{p.policy_number}</td>
                      <td className="px-6 py-4 text-center"><span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-lg font-black">{p.coverage_percentage}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showBillingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mx-auto my-8 w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Nouvelle Transaction Assurance</h3>
              <button onClick={() => setShowBillingModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={billingForm.patient_id} onChange={e => setBillingForm({...billingForm, patient_id: e.target.value})}>
                  <option value="0">Sélectionner un patient</option>
                  {patients?.map(p => <option key={p.id} value={p.id}>{getPatientDisplayName(p)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compagnie</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={billingForm.insurance_company_id} onChange={e => setBillingForm({...billingForm, insurance_company_id: parseInt(e.target.value)})}>
                  <option value={0}>Sélectionner une compagnie</option>
                  {insuranceCompaniesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={billingForm.service_id} onChange={e => setBillingForm({...billingForm, service_id: e.target.value})}>
                  <option value="0">Sélectionner un service</option>
                  {services?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Montant Total</label>
                <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg" value={billingForm.total_amount} onChange={e => setBillingForm({...billingForm, total_amount: parseFloat(e.target.value) || 0})} />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowBillingModal(false)} className="px-4 py-2 text-slate-600 font-medium">Annuler</button>
              <button onClick={handleCreateBilling} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700">Valider la Transaction</button>
            </div>
          </div>
        </div>
      )}
      {showPatientInsuranceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="mx-auto my-8 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Lier un Patient à une Assurance</h3>
              <button onClick={() => setShowPatientInsuranceModal(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" onChange={e => setEditingPatientInsurance({ ...editingPatientInsurance, patient_id: parseInt(e.target.value) } as any)}>
                  <option value="0">Sélectionner un patient</option>
                  {patients?.map(p => <option key={p.id} value={p.id}>{getPatientDisplayName(p)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Compagnie</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg" onChange={e => setEditingPatientInsurance({ ...editingPatientInsurance, insurance_company_id: parseInt(e.target.value) } as any)}>
                  <option value="0">Sélectionner une compagnie</option>
                  {insuranceCompaniesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de Police / Carte</label>
                <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="Ex: ABC-12345" onChange={e => setEditingPatientInsurance({ ...editingPatientInsurance, policy_number: e.target.value } as any)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">% Couverture</label>
                  <input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg" defaultValue={80} onChange={e => setEditingPatientInsurance({ ...editingPatientInsurance, coverage_percentage: parseInt(e.target.value) } as any)} />
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowPatientInsuranceModal(false)} className="px-4 py-2 text-slate-600 font-medium">Annuler</button>
              <button onClick={async () => {
                if (editingPatientInsurance?.patient_id && editingPatientInsurance?.insurance_company_id) {
                  await createPatientInsurance(editingPatientInsurance);
                  setShowPatientInsuranceModal(false);
                }
              }} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
