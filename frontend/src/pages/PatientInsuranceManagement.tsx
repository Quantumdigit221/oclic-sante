import React, { useState, useEffect } from 'react';
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
  UserCheck
} from 'lucide-react';

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
  patient?: any;
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

export const PatientInsuranceManagement: React.FC = () => {
  const { 
    patients, 
    insuranceCompanies, 
    patientInsurances,
    insuranceTransactions,
    createPatientInsurance,
    updatePatientInsurance,
    deletePatientInsurance
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<PatientInsurance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompany, setFilterCompany] = useState<number>(0);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');

  const [formData, setFormData] = useState({
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

  const getPatientDisplayName = (patient: any): string =>
    patient?.name ||
    `${patient?.firstName || ''} ${patient?.lastName || ''}`.trim() ||
    `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim() ||
    (patient?.code ? `Patient ${patient.code}` : 'N/A');

  const fallbackInsuranceRows = (() => {
    const txRows: any[] = Array.isArray(insuranceTransactions) ? insuranceTransactions : [];
    const map = new Map<string, any>();

    txRows.forEach((tx: any) => {
      const patientId = Number(tx.patient_id || 0);
      const companyId = Number(tx.insurance_company_id || 0);
      if (!patientId || !companyId) return;

      const key = `${patientId}-${companyId}`;
      const patient = patients?.find((p: any) => Number(p.id) === patientId);
      const company = insuranceCompanies?.find((c: any) => Number(c.id) === companyId);
      const total = Number(tx.total_amount || 0);
      const coverage = Number(tx.insurance_coverage_amount || 0);
      const coveragePct = total > 0 ? Math.round((coverage / total) * 100) : 100;

      if (!map.has(key)) {
        map.set(key, {
          id: -(map.size + 1),
          patient_id: patientId,
          insurance_company_id: companyId,
          policy_number: tx.claim_reference || `AUTO-${patientId}-${companyId}`,
          member_number: '',
          coverage_percentage: coveragePct,
          max_coverage_amount: 0,
          is_primary: true,
          valid_from: (tx.claim_date || tx.created_at || new Date().toISOString().split('T')[0]).toString().slice(0, 10),
          valid_until: '2099-12-31',
          patient_name: tx.patient_name || getPatientDisplayName(patient),
          patient_email: tx.patient_email || patient?.email || '',
          insurance_company_name: tx.insurance_company_name || company?.name || '',
          insurance_company_code: tx.insurance_company_code || company?.code || '',
          insurance_company_type: tx.insurance_company_type || tx.insurance_company?.type || company?.type || 'AUTRE',
          __readonly: true
        });
      }
    });

    return Array.from(map.values());
  })();

  const insuranceRows =
    Array.isArray(patientInsurances) && patientInsurances.length > 0
      ? patientInsurances
      : fallbackInsuranceRows;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInsurance) {
        await updatePatientInsurance(editingInsurance.id, formData);
      } else {
        await createPatientInsurance(formData);
      }
      setShowModal(false);
      setEditingInsurance(null);
      resetForm();
    } catch (error) {
      console.error('Error saving patient insurance:', error);
    }
  };

  const resetForm = () => {
    setFormData({
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
  };

  const handleEdit = (insurance: PatientInsurance) => {
    if ((insurance as any).__readonly) return;
    setEditingInsurance(insurance);
    setFormData({
      patient_id: insurance.patient_id,
      insurance_company_id: insurance.insurance_company_id,
      policy_number: insurance.policy_number,
      member_number: insurance.member_number,
      coverage_percentage: insurance.coverage_percentage,
      max_coverage_amount: insurance.max_coverage_amount,
      is_primary: insurance.is_primary,
      valid_from: insurance.valid_from,
      valid_until: insurance.valid_until
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (id <= 0) return;
    if (confirm('ÃŠtes-vous sÃ»r de vouloir supprimer cette assurance patient ?')) {
      await deletePatientInsurance(id);
    }
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  const filteredInsurances = insuranceRows.filter((insurance: any) => {
    const matchesSearch = !searchTerm || 
      (insurance.patient?.name || insurance.patient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.policy_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.member_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = filterCompany === 0 || insurance.insurance_company_id === filterCompany;
    
    let matchesStatus = true;
    if (filterStatus === 'active') {
      matchesStatus = !isExpired(insurance.valid_until);
    } else if (filterStatus === 'expired') {
      matchesStatus = isExpired(insurance.valid_until);
    }
    
    return matchesSearch && matchesCompany && matchesStatus;
  });

  const stats = {
    total: insuranceRows.length,
    active: insuranceRows.filter((i: any) => !isExpired(i.valid_until)).length,
    expired: insuranceRows.filter((i: any) => isExpired(i.valid_until)).length,
    primary: insuranceRows.filter((i: any) => i.is_primary).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-teal-600" />
            Assurances Patients
          </h2>
          <p className="text-sm text-slate-500">Gestion des couvertures d'assurance des patients</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Assurance
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Actives</p>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">ExpirÃ©es</p>
              <p className="text-2xl font-bold text-slate-900">{stats.expired}</p>
            </div>
            <X className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Primaires</p>
              <p className="text-2xl font-bold text-slate-900">{stats.primary}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        {Array.isArray(patientInsurances) && patientInsurances.length === 0 && insuranceRows.length > 0 && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Affichage basé sur les transactions existantes (lecture seule). Créez une assurance patient pour activer l’édition.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-slate-200 rounded-lg"
            value={filterCompany}
            onChange={(e) => setFilterCompany(parseInt(e.target.value))}
          >
            <option value={0}>Toutes les compagnies</option>
            {insuranceCompanies?.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-slate-200 rounded-lg"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actives</option>
            <option value="expired">ExpirÃ©es</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            Filtrer
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Compagnie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Police</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Couverture</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ValiditÃ©</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredInsurances.map((insurance) => (
              <tr key={insurance.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{insurance.patient?.name || insurance.patient_name || 'N/A'}</div>
                  <div className="text-sm text-slate-500">{insurance.patient?.email || insurance.patient_email || ''}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      (insurance.insurance_company?.type || (insurance as any).insurance_company_type) === 'IMP' ? 'bg-purple-500' :
                      (insurance.insurance_company?.type || (insurance as any).insurance_company_type) === 'ASSURANCE' ? 'bg-blue-500' :
                      'bg-gray-500'
                    }`} />
                    <div>
                      <div className="font-medium text-slate-900">{insurance.insurance_company?.name || insurance.insurance_company_name || ''}</div>
                      <div className="text-sm text-slate-500">{insurance.insurance_company?.code || insurance.insurance_company_code || ''}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">{insurance.policy_number}</div>
                    <div className="text-slate-500">{insurance.member_number}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="font-medium text-slate-900">{insurance.coverage_percentage}%</div>
                    <div className="text-slate-500">Max: {insurance.max_coverage_amount.toLocaleString()} FCFA</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-slate-900">Du: {new Date(insurance.valid_from).toLocaleDateString('fr-FR')}</div>
                    <div className="text-slate-500">Au: {new Date(insurance.valid_until).toLocaleDateString('fr-FR')}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {insurance.is_primary && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Primaire
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isExpired(insurance.valid_until) 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isExpired(insurance.valid_until) ? 'ExpirÃ©e' : 'Active'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(insurance)}
                      disabled={(insurance as any).__readonly}
                      className="text-blue-600 hover:text-blue-800 p-1 disabled:text-slate-300 disabled:cursor-not-allowed"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(insurance.id)}
                      disabled={(insurance as any).__readonly}
                      className="text-red-600 hover:text-red-800 p-1 disabled:text-slate-300 disabled:cursor-not-allowed"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingInsurance ? 'Modifier' : 'Nouvelle'} Assurance Patient
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Patient</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({...formData, patient_id: parseInt(e.target.value)})}
                    required
                  >
                    <option value={0}>SÃ©lectionner un patient</option>
                    {patients?.map(patient => (
                      <option key={patient.id} value={patient.id}>{patient.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Compagnie d'Assurance</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={formData.insurance_company_id}
                    onChange={(e) => setFormData({...formData, insurance_company_id: parseInt(e.target.value)})}
                    required
                  >
                    <option value={0}>SÃ©lectionner une compagnie</option>
                    {insuranceCompanies?.map(company => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NumÃ©ro de Police</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={formData.policy_number}
                    onChange={(e) => setFormData({...formData, policy_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">NumÃ©ro d'AdhÃ©rent</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={formData.member_number}
                    onChange={(e) => setFormData({...formData, member_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">% Couverture</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={formData.coverage_percentage}
                    onChange={(e) => setFormData({...formData, coverage_percentage: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Montant Maximum (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={formData.max_coverage_amount}
                    onChange={(e) => setFormData({...formData, max_coverage_amount: parseFloat(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de dÃ©but</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_primary"
                  className="mr-2"
                  checked={formData.is_primary}
                  onChange={(e) => setFormData({...formData, is_primary: e.target.checked})}
                />
                <label htmlFor="is_primary" className="text-sm text-slate-700">
                  Assurance primaire
                </label>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingInsurance(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-slate-900 rounded-lg"
                >
                  {editingInsurance ? 'Mettre Ã  jour' : 'CrÃ©er'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
