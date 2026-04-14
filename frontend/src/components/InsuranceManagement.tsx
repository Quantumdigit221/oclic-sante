import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  FileText, 
  RefreshCcw, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle,
  Clock,
  Search,
  Building
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  email?: string;
  address?: string;
  coverage_percentage: number;
}

interface PatientInsurance {
  id: string;
  patient_id: string;
  patient_name: string;
  insurance_company_id: string;
  company_name: string;
  policy_number: string;
  coverage_percentage: number;
}

interface Transaction {
  id: string;
  ticket_number: string;
  patient_name: string;
  company_name: string;
  amount_covered: number;
  status: 'PENDING' | 'PAID';
  createdAt: string;
}

export const InsuranceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'companies' | 'patients' | 'transactions'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [policies, setPolicies] = useState<PatientInsurance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Mocking parallel API calls - replaced by real fetch in production
      const [cRes, pRes, tRes] = await Promise.all([
        fetch('/api/insurance-companies'),
        fetch('/api/patient-insurances'),
        fetch('/api/insurance-transactions')
      ]);
      
      setCompanies(await cRes.json());
      setPolicies(await pRes.json());
      setTransactions(await tRes.json());
    } catch (error) {
      console.error("Error loading insurance data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Gestion des Assurances</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Contrôle des polices, compagnies et suivi des recouvrements</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={loadData}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-semibold shadow-sm flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" /> Actualiser
          </button>
          <button 
            className="flex-1 md:flex-none px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-bold shadow-md shadow-teal-100 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nouveau
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-px no-scrollbar">
        {[
          { id: 'companies', label: 'Compagnies', icon: <Building className="w-4 h-4" /> },
          { id: 'patients', label: 'Polices Patients', icon: <Users className="w-4 h-4" /> },
          { id: 'transactions', label: 'Transactions & Recouvrement', icon: <FileText className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === tab.id ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={activeTab === tab.id ? 'opacity-100' : 'opacity-50'}>{tab.icon}</span>
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCcw className="w-6 h-6 animate-spin" /> Chargement des données...
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-2 duration-400">
            {activeTab === 'companies' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => (
                  <div key={company.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-teal-500">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center text-xl font-bold">
                        {company.name[0]}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{company.name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{company.email || company.address || 'Aucune information'}</p>
                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-sm">
                      <span className="text-slate-400 font-medium tracking-tight">Couverture Standard</span>
                      <span className="font-extrabold text-teal-700 bg-teal-50 px-3 py-1 rounded-full">{company.coverage_percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'patients' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Patient</th>
                      <th className="px-6 py-4">Compagnie</th>
                      <th className="px-6 py-4">N° de Carte</th>
                      <th className="px-6 py-4 text-center">Taux</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 italic">
                    {policies.map(policy => (
                      <tr key={policy.id} className="hover:bg-teal-50/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{policy.patient_name}</td>
                        <td className="px-6 py-4 text-slate-600">{policy.company_name}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400 font-bold tracking-widest">{policy.policy_number}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 rounded-lg font-black">{policy.coverage_percentage}%</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Edit2 className="w-4 h-4" /></button>
                             <button className="p-2 hover:bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Ticket</th>
                      <th className="px-6 py-4">Détails Tiers</th>
                      <th className="px-6 py-4 text-right">Montant Assurance</th>
                      <th className="px-6 py-4 text-center">Statut</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-slate-400 text-xs font-bold">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-black text-slate-900">#${t.ticket_number}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{t.patient_name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1"><Shield className="w-3 h-3 text-teal-500" /> {t.company_name}</div>
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-teal-700">{formatCFA(t.amount_covered)}</td>
                        <td className="px-6 py-4 text-center">
                          {t.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black tracking-widest">
                              <CheckCircle className="w-3 h-3" /> PAYÉ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black tracking-widest">
                              <Clock className="w-3 h-3" /> ATTENTE
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                           {t.status === 'PENDING' && (
                             <button className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-50 hover:bg-teal-700 transition-all opacity-0 group-hover:opacity-100">
                               Recouvrer
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsuranceManagement;
