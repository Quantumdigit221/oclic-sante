import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { 
  Shield, 
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
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CreditCard,
  Building,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Users,
  Activity,
  BarChart3,
  PieChart,
  FileDown
} from 'lucide-react';

interface InsuranceClaim {
  id: number;
  patient_id: number;
  insurance_company_id: number;
  consultation_id: number;
  total_amount: number;
  patient_paid_amount: number;
  insurance_coverage_amount: number;
  remaining_amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'PARTIAL';
  claim_reference: string;
  claim_date: string;
  payment_date: string;
  notes: string;
  insurance_company?: InsuranceCompany;
  patient?: any;
  consultation?: any;
}

interface InsuranceCompany {
  id: number;
  name: string;
  code: string;
  type: 'IMP' | 'ASSURANCE' | 'AUTRE';
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

export const InsuranceClaimsManagement: React.FC = () => {
  const { 
    patients, 
    insuranceCompanies, 
    consultations,
    insuranceTransactions,
    createInsuranceTransaction,
    updateInsuranceTransaction
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingClaim, setEditingClaim] = useState<InsuranceClaim | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCompany, setFilterCompany] = useState<number>(0);
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [statusDrafts, setStatusDrafts] = useState<Record<number, string>>({});

  const [formData, setFormData] = useState({
    patient_id: 0,
    insurance_company_id: 0,
    consultation_id: 0,
    total_amount: 0,
    patient_paid_amount: 0,
    insurance_coverage_percentage: 100,
    claim_reference: '',
    notes: ''
  });

  const claimsRows: any[] = Array.isArray(insuranceTransactions) ? insuranceTransactions : [];

  const getPatientName = (claim: any): string =>
    claim?.patient?.name ||
    claim?.patient_name ||
    `${claim?.patient?.firstName || ''} ${claim?.patient?.lastName || ''}`.trim() ||
    'N/A';

  const getCompanyMeta = (claim: any): any =>
    claim?.insurance_company ||
    insuranceCompanies?.find((c: any) => Number(c.id) === Number(claim?.insurance_company_id));

  const getCompanyName = (claim: any): string =>
    claim?.insurance_company?.name ||
    claim?.insurance_company_name ||
    getCompanyMeta(claim)?.name ||
    'N/A';

  const getClaimReference = (claim: any): string => {
    const ref = String(claim?.claim_reference || '').trim();
    if (ref) return ref;
    const id = Number(claim?.id);
    return Number.isFinite(id) && id > 0 ? `CLAIM-${String(id).padStart(6, '0')}` : 'N/A';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const insuranceCoverage = (formData.total_amount * formData.insurance_coverage_percentage) / 100;
      const patientResponsibility = formData.total_amount - insuranceCoverage;
      
      const claimData = {
        ...formData,
        insurance_coverage_amount: insuranceCoverage,
        patient_paid_amount: patientResponsibility,
        remaining_amount: 0,
        status: editingClaim?.status || 'PENDING',
        claim_date: editingClaim?.claim_date || new Date().toISOString().split('T')[0],
        claim_reference:
          String(formData.claim_reference || '').trim() ||
          editingClaim?.claim_reference ||
          `CLAIM-${new Date().getFullYear()}-${String(claimsRows.length + 1).padStart(3, '0')}`
      };

      if (editingClaim) {
        await updateInsuranceTransaction(editingClaim.id, claimData);
      } else {
        await createInsuranceTransaction(claimData);
      }
      
      setShowModal(false);
      setEditingClaim(null);
      resetForm();
    } catch (error) {
      console.error('Error saving insurance claim:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: 0,
      insurance_company_id: 0,
      consultation_id: 0,
      total_amount: 0,
      patient_paid_amount: 0,
      insurance_coverage_percentage: 100,
      claim_reference: '',
      notes: ''
    });
  };

  const handleEdit = (claim: InsuranceClaim) => {
    setEditingClaim(claim);
    setFormData({
      patient_id: claim.patient_id,
      insurance_company_id: claim.insurance_company_id,
      consultation_id: claim.consultation_id,
      total_amount: claim.total_amount,
      patient_paid_amount: claim.patient_paid_amount,
      insurance_coverage_percentage: Math.round((claim.insurance_coverage_amount / claim.total_amount) * 100) || 100,
      claim_reference: claim.claim_reference,
      notes: claim.notes
    });
    setShowModal(true);
  };

  const handleStatusUpdate = async (claimId: number, newStatus: string) => {
    await updateInsuranceTransaction(claimId, {
      status: newStatus,
      payment_date: newStatus === 'PAID' ? new Date().toISOString().split('T')[0] : null
    });

    if (statusDrafts[claimId]) {
      const newDrafts = { ...statusDrafts };
      delete newDrafts[claimId];
      setStatusDrafts(newDrafts);
    }
  };

  const getStatusColor = (status: string) => {
    const normalized = String(status || '').trim().toUpperCase();
    switch (normalized) {
      case 'PAID': return 'text-green-600 bg-green-50';
      case 'APPROVED': return 'text-blue-600 bg-blue-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'PARTIAL': return 'text-orange-600 bg-orange-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusLabel = (status: string) => {
    const normalized = String(status || '').trim().toUpperCase();
    switch (normalized) {
      case 'PENDING': return 'EN ATTENTE';
      case 'APPROVED': return 'APPROUVÉ';
      case 'REJECTED': return 'REJETÉ';
      case 'PAID': return 'PAYÉ';
      case 'PARTIAL': return 'PARTIEL';
      default: return normalized;
    }
  };

  const getStatusIcon = (status: string) => {
    const normalized = String(status || '').trim().toUpperCase();
    switch (normalized) {
      case 'PAID': return <Check className="w-4 h-4" />;
      case 'APPROVED': return <Clock className="w-4 h-4" />;
      case 'REJECTED': return <X className="w-4 h-4" />;
      case 'PARTIAL': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredClaims = useMemo(() => {
    return claimsRows.filter((claim: any) => {
      const patient = claim.patient || {};
      const name = (patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || claim.patient_name || '').toLowerCase();
      const ref = (claim.claim_reference || '').toLowerCase();
      const comp = (claim.insurance_company?.name || claim.insurance_company_name || '').toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || name.includes(search) || ref.includes(search) || comp.includes(search);
      const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
      const matchesCompany = filterCompany === 0 || Number(claim.insurance_company_id) === filterCompany;
      
      let matchesDate = true;
      if (filterDateRange.start && filterDateRange.end) {
        const claimDate = new Date(claim.claim_date);
        const startDate = new Date(filterDateRange.start);
        const endDate = new Date(filterDateRange.end);
        matchesDate = claimDate >= startDate && claimDate <= endDate;
      }
      return matchesSearch && matchesStatus && matchesCompany && matchesDate;
    });
  }, [claimsRows, searchTerm, filterStatus, filterCompany, filterDateRange]);

  const stats = useMemo(() => ({
    total: claimsRows.length,
    pending: claimsRows.filter((c: any) => c.status === 'PENDING').length,
    approved: claimsRows.filter((c: any) => c.status === 'APPROVED').length,
    paid: claimsRows.filter((c: any) => c.status === 'PAID').length,
    totalAmount: claimsRows.reduce((sum: number, c: any) => sum + (Number(c.total_amount) || 0), 0),
    totalCoverage: claimsRows.reduce((sum: number, c: any) => sum + (Number(c.insurance_coverage_amount) || 0), 0)
  }), [claimsRows]);

  const exportToCSV = () => {
    const headers = ['Référence', 'Patient', 'Compagnie', 'Montant Total', 'Couverture', 'Statut', 'Date'];
    const csvData = filteredClaims.map((claim: any) => [
      getClaimReference(claim),
      getPatientName(claim),
      getCompanyName(claim),
      claim.total_amount.toString(),
      claim.insurance_coverage_amount.toString(),
      claim.status,
      claim.claim_date
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reclamations-assurance-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            Réclamations Assurance
          </h2>
          <p className="text-sm text-slate-500">Gestion des réclamations et remboursements</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
          <button onClick={() => { resetForm(); setEditingClaim(null); setShowModal(true); }} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Nouvelle Réclamation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Réclamations', val: stats.total, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'En Attente', val: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Approuvées', val: stats.approved, icon: Check, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Montant Total', val: `${stats.totalAmount.toLocaleString()} FCFA`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-500 font-medium">{s.label}</p><p className="text-2xl font-black text-slate-900 mt-1">{s.val}</p></div>
              <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-xl flex items-center justify-center`}><s.icon className="w-6 h-6" /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Approuvées</option>
          <option value="REJECTED">Rejetées</option>
          <option value="PAID">Payées</option>
        </select>
        <select className="px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-white font-medium" value={filterCompany} onChange={(e) => setFilterCompany(parseInt(e.target.value))}>
          <option value={0}>Toutes les compagnies</option>
          {insuranceCompanies?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" className="px-3 py-2.5 border border-slate-200 rounded-lg outline-none font-medium" value={filterDateRange.start} onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})} />
        <input type="date" className="px-3 py-2.5 border border-slate-200 rounded-lg outline-none font-medium" value={filterDateRange.end} onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-left">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Référence</th><th className="px-6 py-4">Patient</th><th className="px-6 py-4">Compagnie</th><th className="px-6 py-4">Assurance</th><th className="px-6 py-4">Statut</th><th className="px-6 py-4">Date</th><th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {filteredClaims.map((claim) => {
                const status = claim.status || 'PENDING';
                return (
                  <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400 group-hover:text-teal-600">{getClaimReference(claim)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{getPatientName(claim)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{getCompanyName(claim)}</td>
                    <td className="px-6 py-4 text-sm font-black text-teal-600">{claim.insurance_coverage_amount.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black rounded-full flex items-center gap-1 w-fit uppercase ${getStatusColor(status)}`}>
                        {getStatusIcon(status)} {getStatusLabel(status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(claim.claim_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 not-italic">
                        <button onClick={() => handleEdit(claim)} className="p-1.5 text-slate-400 hover:text-blue-600"><Eye className="w-4 h-4" /></button>
                        <select className="text-[10px] font-bold border-none bg-slate-100 rounded px-1 py-1 focus:ring-0 cursor-pointer" value={statusDrafts[claim.id] || status} onChange={(e) => setStatusDrafts({...statusDrafts, [claim.id]: e.target.value})}>
                          <option value="PENDING">EN ATTENTE</option>
                          <option value="APPROVED">APPROUVÉ</option>
                          <option value="REJECTED">REJETÉ</option>
                          <option value="PAID">PAYÉ</option>
                        </select>
                        <button onClick={() => handleStatusUpdate(claim.id, statusDrafts[claim.id] || status)} disabled={!statusDrafts[claim.id] || statusDrafts[claim.id] === status} className="p-1.5 text-teal-600 hover:bg-teal-100 rounded-lg disabled:opacity-30"><Check className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900">{editingClaim ? 'Modifier' : 'Nouvelle'} Réclamation</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-slate-500 uppercase">Patient</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={formData.patient_id} onChange={(e) => setFormData({...formData, patient_id: parseInt(e.target.value)})} required>
                    <option value={0}>Sélectionner un patient</option>{patients?.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Compagnie</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={formData.insurance_company_id} onChange={(e) => setFormData({...formData, insurance_company_id: parseInt(e.target.value)})} required>
                    <option value={0}>Sélectionner une compagnie</option>{insuranceCompanies?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Consultation</label>
                  <select className="w-full px-3 py-2 border rounded-lg font-medium" value={formData.consultation_id} onChange={(e) => setFormData({...formData, consultation_id: parseInt(e.target.value)})} required>
                    <option value={0}>Sélectionner une consultation</option>{consultations?.filter(c => !formData.patient_id || Number(c.patientId) === formData.patient_id).map(c => <option key={c.id} value={c.id}>{c.patientName} - {new Date(c.createdAt).toLocaleDateString()}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Montant Total</label><input type="number" className="w-full px-3 py-2 border rounded-lg font-bold" value={formData.total_amount} onChange={(e) => setFormData({...formData, total_amount: parseFloat(e.target.value)})} required /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">% Couverture</label><input type="number" className="w-full px-3 py-2 border rounded-lg font-bold" value={formData.insurance_coverage_percentage} onChange={(e) => setFormData({...formData, insurance_coverage_percentage: parseInt(e.target.value)})} required /></div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-sm font-bold text-slate-500">Annuler</button>
                <button type="submit" className="px-8 py-2 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all active:scale-95">Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
