import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  Shield, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  AlertCircle
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

export const InsuranceManagement: React.FC = () => {
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

  // Vérifications de sécurité pour éviter les erreurs filter
  const insuranceCompaniesList = Array.isArray(insuranceCompanies) ? insuranceCompanies : [];
  const insuranceTransactionsList = Array.isArray(insuranceTransactions) ? insuranceTransactions : [];
  const patientInsurancesList = Array.isArray(patientInsurances) ? patientInsurances : [];

  const [activeTab, setActiveTab] = useState<'companies' | 'patients' | 'transactions' | 'reports'>('companies');
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showPatientInsuranceModal, setShowPatientInsuranceModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);
  const [editingPatientInsurance, setEditingPatientInsurance] = useState<PatientInsurance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const [patientInsuranceForm, setPatientInsuranceForm] = useState({
    patient_id: 0,
    insurance_company_id: 0,
    policy_number: '',
    member_number: '',
    coverage_percentage: 100,
    max_coverage_amount: 0,
    is_primary: true,
    valid_from: '',
    valid_until: ''
  });

  // Calcul des statistiques
  const stats = {
    totalCompanies: insuranceCompaniesList.length,
    activeCompanies: insuranceCompaniesList.filter(c => c.is_active).length,
    totalTransactions: insuranceTransactionsList.length,
    pendingTransactions: insuranceTransactionsList.filter(t => t.status === 'PENDING').length,
    totalCoverageAmount: insuranceTransactionsList.reduce((sum, t) => sum + toAmount(t.insurance_coverage_amount), 0) || 0,
    totalPatientResponsibility: insuranceTransactionsList.reduce((sum, t) => sum + toAmount(t.patient_responsibility_amount ?? t.patient_paid_amount), 0) || 0
  };

  // Filtrage
  const filteredCompanies = insuranceCompaniesList.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = insuranceTransactionsList.filter(transaction => {
    const matchesSearch = !searchTerm || 
      transaction.claim_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.insurance_company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const handleSaveCompany = async () => {
    try {
      if (editingCompany) {
        await updateInsuranceCompany(editingCompany.id, companyForm);
      } else {
        await createInsuranceCompany(companyForm);
      }
      setShowCompanyModal(false);
      setEditingCompany(null);
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
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleEditCompany = (company: InsuranceCompany) => {
    setEditingCompany(company);
    setCompanyForm(company);
    setShowCompanyModal(true);
  };

  const handleDeleteCompany = async (id: number) => {
    if (confirm('ÃŠtes-vous sÃ»r de vouloir supprimer cette compagnie ?')) {
      await deleteInsuranceCompany(id);
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <Check className="w-4 h-4" />;
      case 'APPROVED': return <Clock className="w-4 h-4" />;
      case 'REJECTED': return <X className="w-4 h-4" />;
      case 'PARTIAL': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-600" />
            Gestion Assurance & IPM
          </h2>
          <p className="text-sm text-slate-500">Gestion des compagnies d'assurance et remboursements</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Compagnies</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCompanies}</p>
            </div>
            <Shield className="w-8 h-8 text-teal-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalTransactions}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">En Attente</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingTransactions}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Couverture</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalCoverageAmount.toLocaleString()} FCFA</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {[
            { id: 'companies', label: 'Compagnies', icon: Shield },
            { id: 'patients', label: 'Patients', icon: Users },
            { id: 'transactions', label: 'Transactions', icon: FileText },
            { id: 'reports', label: 'Rapports', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Onglet Compagnies */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Rechercher une compagnie..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowCompanyModal(true)}
              className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle Compagnie
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Couverture</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{company.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{company.code}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        company.type === 'IMP' ? 'bg-purple-100 text-purple-800' :
                        company.type === 'ASSURANCE' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {company.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {company.coverage_percentage}% / {company.max_coverage_amount.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {company.contact_person}<br />
                      {company.phone}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {company.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditCompany(company)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Compagnie */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
          <div className="mx-auto my-4 md:my-8 w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-5 text-white">
              <h3 className="text-xl font-semibold">
                {editingCompany ? 'Modifier' : 'Nouvelle'} Compagnie d'Assurance
              </h3>
              <p className="text-sm text-teal-50 mt-1">Renseignez les informations de couverture et de contact.</p>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})}
                  placeholder="Ex: CNAM, AXA, NSIA..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={companyForm.code}
                  onChange={(e) => setCompanyForm({...companyForm, code: e.target.value})}
                  placeholder="Code interne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={companyForm.type}
                  onChange={(e) => setCompanyForm({...companyForm, type: e.target.value as any})}
                >
                  <option value="IMP">IMP</option>
                  <option value="ASSURANCE">Assurance</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
              <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">% Couverture</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={companyForm.coverage_percentage}
                    onChange={(e) => setCompanyForm({...companyForm, coverage_percentage: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Couverture (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={companyForm.max_coverage_amount}
                    onChange={(e) => setCompanyForm({...companyForm, max_coverage_amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="md:col-span-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Couverture standard: {companyForm.coverage_percentage || 0}% | Plafond: {(companyForm.max_coverage_amount || 0).toLocaleString()} FCFA
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Personne Ã  contacter</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={companyForm.contact_person}
                  onChange={(e) => setCompanyForm({...companyForm, contact_person: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">TÃ©lÃ©phone</label>
                <input
                  type="text"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <textarea
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={3}
                  value={companyForm.address}
                  onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})}
                  placeholder="Adresse complete de la compagnie"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => {
                  setShowCompanyModal(false);
                  setEditingCompany(null);
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveCompany}
                className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium shadow-sm transition-colors"
              >
                {editingCompany ? 'Mettre Ã  jour' : 'CrÃ©er'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

