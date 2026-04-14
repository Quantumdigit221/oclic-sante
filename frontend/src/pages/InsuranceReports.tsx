import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { 
  FileText, 
  Download, 
  Filter,
  Calendar,
  DollarSign,
  Shield,
  Users,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';

interface InsuranceReport {
  id: number;
  insurance_company_name: string;
  patient_count: number;
  total_services: number;
  total_amount: number;
  total_patient_paid: number;
  total_insurance_coverage: number;
  total_remaining: number;
  pending_claims: number;
  approved_claims: number;
  rejected_claims: number;
  paid_claims: number;
}

interface PatientInsuranceReport {
  patient_id: number;
  patient_name: string;
  insurance_company_name: string;
  policy_number: string;
  total_visits: number;
  total_amount: number;
  patient_responsibility: number;
  insurance_coverage: number;
  remaining_balance: number;
  last_visit_date: string;
}

export const InsuranceReports: React.FC = () => {
  const { 
    insuranceTransactions, 
    insuranceCompanies, 
    patientInsurances,
    patients,
    services,
    consultations 
  } = useStore();

  const [reportType, setReportType] = useState<'company' | 'patient' | 'monthly'>('company');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedCompany, setSelectedCompany] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const toAmount = (value: any): number => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const txRows = Array.isArray(insuranceTransactions) ? insuranceTransactions : [];
  const getPatientName = (transaction: any): string =>
    transaction?.patient?.name ||
    transaction?.patient_name ||
    `${transaction?.patient?.firstName || ''} ${transaction?.patient?.lastName || ''}`.trim() ||
    `${transaction?.patient?.first_name || ''} ${transaction?.patient?.last_name || ''}`.trim() ||
    'N/A';

  const getCompanyName = (transaction: any): string =>
    transaction?.insurance_company?.name ||
    transaction?.insurance_company_name ||
    insuranceCompanies?.find((c: any) => Number(c.id) === Number(transaction?.insurance_company_id))?.name ||
    'N/A';

  const getTxDate = (transaction: any): Date | null => {
    const raw = transaction?.claim_date || transaction?.created_at || transaction?.updated_at;
    if (!raw) return null;
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  // Calcul des rapports
  const generateCompanyReports = (sourceTransactions: any[]): InsuranceReport[] => {
    return insuranceCompanies?.map(company => {
      const companyTransactions = sourceTransactions.filter((t) => Number(t.insurance_company_id) === Number(company.id)) || [];
      const companyPatientInsurances = patientInsurances?.filter(pi => pi.insurance_company_id === company.id) || [];
      const uniquePatientsFromTx = new Set(
        companyTransactions.map((t: any) => Number(t.patient_id)).filter((id: number) => Number.isFinite(id) && id > 0)
      );
      
      return {
        id: company.id,
        insurance_company_name: company.name,
        patient_count: Math.max(companyPatientInsurances.length, uniquePatientsFromTx.size),
        total_services: companyTransactions.length,
        total_amount: companyTransactions.reduce((sum, t) => sum + toAmount(t.total_amount), 0),
        total_patient_paid: companyTransactions.reduce((sum, t) => sum + toAmount(t.patient_paid_amount), 0),
        total_insurance_coverage: companyTransactions.reduce((sum, t) => sum + toAmount(t.insurance_coverage_amount), 0),
        total_remaining: companyTransactions.reduce((sum, t) => sum + toAmount(t.remaining_amount), 0),
        pending_claims: companyTransactions.filter(t => t.status === 'PENDING').length,
        approved_claims: companyTransactions.filter(t => t.status === 'APPROVED').length,
        rejected_claims: companyTransactions.filter(t => t.status === 'REJECTED').length,
        paid_claims: companyTransactions.filter(t => t.status === 'PAID').length
      };
    }) || [];
  };

  const generatePatientReports = (sourceTransactions: any[]): PatientInsuranceReport[] => {
    const patientMap = new Map<number, PatientInsuranceReport>();
    
    sourceTransactions.forEach((transaction: any) => {
      const patientId = Number(transaction.patient_id);
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patient_id: patientId,
          patient_name: getPatientName(transaction),
          insurance_company_name: getCompanyName(transaction),
          policy_number: '',
          total_visits: 0,
          total_amount: 0,
          patient_responsibility: 0,
          insurance_coverage: 0,
          remaining_balance: 0,
          last_visit_date: ''
        });
      }
      
      const report = patientMap.get(patientId);
      report.total_visits += 1;
      report.total_amount += toAmount(transaction.total_amount);
      report.patient_responsibility += toAmount(transaction.patient_paid_amount);
      report.insurance_coverage += toAmount(transaction.insurance_coverage_amount);
      report.remaining_balance += toAmount(transaction.remaining_amount);
      
      const txDate = getTxDate(transaction);
      if (txDate && (!report.last_visit_date || txDate > new Date(report.last_visit_date))) {
        report.last_visit_date = txDate.toISOString();
      }
    });
    
    return Array.from(patientMap.values());
  };

  const filteredTransactions = txRows.filter((transaction: any) => {
    const transactionDate = getTxDate(transaction);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const dateMatch = !transactionDate || (transactionDate >= startDate && transactionDate <= endDate);
    const companyMatch = selectedCompany === 0 || Number(transaction.insurance_company_id) === Number(selectedCompany);
    
    return dateMatch && companyMatch;
  });

  const companyReports = generateCompanyReports(filteredTransactions);
  const patientReports = generatePatientReports(filteredTransactions);

  // Statistiques globales
  const globalStats = {
    totalTransactions: filteredTransactions.length,
    totalAmount: filteredTransactions.reduce((sum, t) => sum + toAmount(t.total_amount), 0),
    totalPatientPaid: filteredTransactions.reduce((sum, t) => sum + toAmount(t.patient_paid_amount), 0),
    totalInsuranceCoverage: filteredTransactions.reduce((sum, t) => sum + toAmount(t.insurance_coverage_amount), 0),
    totalRemaining: filteredTransactions.reduce((sum, t) => sum + toAmount(t.remaining_amount), 0),
    pendingClaims: filteredTransactions.filter(t => t.status === 'PENDING').length,
    approvedClaims: filteredTransactions.filter(t => t.status === 'APPROVED').length,
    rejectedClaims: filteredTransactions.filter(t => t.status === 'REJECTED').length,
    paidClaims: filteredTransactions.filter(t => t.status === 'PAID').length
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportCompanyReport = () => {
    exportToCSV(companyReports, `rapport-compagnies-${new Date().toISOString().split('T')[0]}`);
  };

  const exportPatientReport = () => {
    exportToCSV(patientReports, `rapport-patients-${new Date().toISOString().split('T')[0]}`);
  };

  const exportTransactionReport = () => {
    const transactionData = filteredTransactions.map(t => ({
      'ID Transaction': t.id,
      'Patient': getPatientName(t),
      'Compagnie': getCompanyName(t),
      'Montant Total': toAmount(t.total_amount),
      'Montant Patient': toAmount(t.patient_paid_amount),
      'Couverture Assurance': toAmount(t.insurance_coverage_amount),
      'Montant Restant': toAmount(t.remaining_amount),
      'Statut': t.status,
      'Référence': t.claim_reference || 'N/A',
      'Date Création': t.created_at,
      'Date Paiement': t.payment_date || 'N/A'
    }));
    
    exportToCSV(transactionData, `transactions-assurance-${new Date().toISOString().split('T')[0]}`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-teal-600" />
            Rapports Assurance & IMP
          </h2>
          <p className="text-sm text-slate-500">Analyse des transactions et remboursements</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </button>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type de rapport</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
              >
                <option value="company">Par Compagnie</option>
                <option value="patient">Par Patient</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Transactions</p>
              <p className="text-2xl font-bold text-slate-900">{globalStats.totalTransactions}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Montant Total</p>
              <p className="text-2xl font-bold text-slate-900">{globalStats.totalAmount.toLocaleString()} FCFA</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Couverture Assurance</p>
              <p className="text-2xl font-bold text-slate-900">{globalStats.totalInsuranceCoverage.toLocaleString()} FCFA</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">En Attente</p>
              <p className="text-2xl font-bold text-slate-900">{globalStats.pendingClaims}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Rapport par Compagnie */}
      {reportType === 'company' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Rapport par Compagnie</h3>
            <button
              onClick={exportCompanyReport}
              className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Compagnie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Services</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Montant Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Couverture</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Restant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">En Attente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companyReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{report.insurance_company_name}</td>
                    <td className="px-6 py-4 text-slate-600">{report.patient_count}</td>
                    <td className="px-6 py-4 text-slate-600">{report.total_services}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{report.total_amount.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-green-600 font-medium">{report.total_insurance_coverage.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-orange-600 font-medium">{report.total_remaining.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {report.pending_claims} en attente
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rapport par Patient */}
      {reportType === 'patient' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Rapport par Patient</h3>
            <button
              onClick={exportPatientReport}
              className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Compagnie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Visites</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Responsabilité Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Couverture</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Solde</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patientReports.map((report) => (
                  <tr key={report.patient_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{report.patient_name}</td>
                    <td className="px-6 py-4 text-slate-600">{report.insurance_company_name}</td>
                    <td className="px-6 py-4 text-slate-600">{report.total_visits}</td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{report.total_amount.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-orange-600 font-medium">{report.patient_responsibility.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-green-600 font-medium">{report.insurance_coverage.toLocaleString()} FCFA</td>
                    <td className="px-6 py-4 text-red-600 font-medium">{report.remaining_balance.toLocaleString()} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transactions détaillées */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Transactions Détaillées</h3>
          <button
            onClick={exportTransactionReport}
            className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
        
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Compagnie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Montant Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Patient Payé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Couverture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Restant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTransactions.slice(0, 50).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-600">
                    {getTxDate(transaction)?.toLocaleDateString('fr-FR') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{getPatientName(transaction)}</td>
                  <td className="px-6 py-4 text-slate-600">{getCompanyName(transaction)}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{toAmount(transaction.total_amount).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-orange-600 font-medium">{toAmount(transaction.patient_paid_amount).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{toAmount(transaction.insurance_coverage_amount).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4 text-red-600 font-medium">{toAmount(transaction.remaining_amount).toLocaleString()} FCFA</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
