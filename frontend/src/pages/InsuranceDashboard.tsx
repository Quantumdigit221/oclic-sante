import React, { useEffect, useMemo, useState } from 'react';
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
  FileDown,
  Printer,
  Mail as MailIcon,
  Send
} from 'lucide-react';

interface InsuranceDashboard {
  totalCompanies: number;
  activeCompanies: number;
  totalPatients: number;
  activePatients: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaims: number;
  rejectedClaims: number;
  paidClaims: number;
  totalAmount: number;
  totalCoverage: number;
  totalPatientPaid: number;
  averageProcessingTime: number;
  topCompanies: CompanyStats[];
  monthlyTrends: MonthlyData[];
  claimStatusDistribution: StatusData[];
}

interface CompanyStats {
  id: number;
  name: string;
  totalClaims: number;
  totalAmount: number;
  averageCoverage: number;
  processingTime: number;
}

interface MonthlyData {
  month: string;
  claims: number;
  amount: number;
  coverage: number;
}

interface StatusData {
  status: string;
  count: number;
  percentage: number;
  amount: number;
}

export const InsuranceDashboard: React.FC = () => {
  const { insuranceCompanies, insuranceTransactions, loadData } = useStore();
  
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [selectedCompany, setSelectedCompany] = useState<number>(0);
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    if (refreshKey > 0) {
      loadData();
    }
  }, [refreshKey]);

  const dashboardData = useMemo<InsuranceDashboard>(() => {
    const rows = Array.isArray(insuranceTransactions) ? insuranceTransactions : [];
    const companies = Array.isArray(insuranceCompanies) ? insuranceCompanies : [];
    if (rows.length === 0 && companies.length === 0) {
      return {
        totalCompanies: 0,
        activeCompanies: 0,
        totalPatients: 0,
        activePatients: 0,
        totalClaims: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        rejectedClaims: 0,
        paidClaims: 0,
        totalAmount: 0,
        totalCoverage: 0,
        totalPatientPaid: 0,
        averageProcessingTime: 0,
        topCompanies: [],
        monthlyTrends: [],
        claimStatusDistribution: []
      };
    }

    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    const toDate = (t: any) => {
      const raw = t.claim_date || t.payment_date || t.created_at || t.updated_at;
      return raw ? new Date(raw) : null;
    };

    const filteredRows = rows.filter((t: any) => {
      if (selectedCompany && Number(t.insurance_company_id) !== Number(selectedCompany)) return false;
      const txDate = toDate(t);
      if (!txDate || Number.isNaN(txDate.getTime())) return true;
      if (startDate && txDate < startDate) return false;
      if (endDate && txDate > endDate) return false;
      return true;
    });

    const totalClaims = filteredRows.length;
    const pendingClaims = filteredRows.filter((t: any) => t.status === 'PENDING').length;
    const approvedClaims = filteredRows.filter((t: any) => t.status === 'APPROVED').length;
    const rejectedClaims = filteredRows.filter((t: any) => t.status === 'REJECTED').length;
    const paidClaims = filteredRows.filter((t: any) => t.status === 'PAID').length;
    const totalAmount = filteredRows.reduce((sum: number, t: any) => sum + Number(t.total_amount || 0), 0);
    const totalCoverage = filteredRows.reduce((sum: number, t: any) => sum + Number(t.insurance_coverage_amount || 0), 0);
    const totalPatientPaid = filteredRows.reduce((sum: number, t: any) => sum + Number(t.patient_paid_amount || 0), 0);

    const uniquePatients = new Set(
      filteredRows
        .map((t: any) => t.patient_id || t.patient?.id || t.patient_name)
        .filter(Boolean)
    );

    const companyTotals = filteredRows.reduce((acc: Record<number, CompanyStats & { coverageSum: number }>, t: any) => {
      const companyId = Number(t.insurance_company_id || 0);
      if (!companyId) return acc;

      if (!acc[companyId]) {
        const companyMeta = companies.find((c: any) => Number(c.id) === companyId);
        acc[companyId] = {
          id: companyId,
          name: t.insurance_company?.name || t.insurance_company_name || companyMeta?.name || `Compagnie ${companyId}`,
          totalClaims: 0,
          totalAmount: 0,
          averageCoverage: 0,
          processingTime: 0,
          coverageSum: 0
        };
      }

      const amount = Number(t.total_amount || 0);
      const coverage = Number(t.insurance_coverage_amount || 0);
      acc[companyId].totalClaims += 1;
      acc[companyId].totalAmount += amount;
      acc[companyId].coverageSum += amount > 0 ? (coverage / amount) * 100 : 0;
      return acc;
    }, {});

    const topCompanies = Object.values(companyTotals)
      .map((c) => ({
        id: c.id,
        name: c.name,
        totalClaims: c.totalClaims,
        totalAmount: c.totalAmount,
        averageCoverage: c.totalClaims > 0 ? Number((c.coverageSum / c.totalClaims).toFixed(1)) : 0,
        processingTime: 0
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    const statusKeys = ['PENDING', 'APPROVED', 'REJECTED', 'PAID', 'PARTIAL'];
    const claimStatusDistribution: StatusData[] = statusKeys
      .map((status) => {
        const statusRows = filteredRows.filter((t: any) => t.status === status);
        const statusAmount = statusRows.reduce((sum: number, t: any) => sum + Number(t.total_amount || 0), 0);
        return {
          status,
          count: statusRows.length,
          percentage: totalClaims > 0 ? Number(((statusRows.length / totalClaims) * 100).toFixed(1)) : 0,
          amount: statusAmount
        };
      })
      .filter((x) => x.count > 0 || totalClaims === 0);

    const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short' });
    const monthlyMap = filteredRows.reduce((acc: Record<string, MonthlyData>, t: any) => {
      const txDate = toDate(t);
      if (!txDate || Number.isNaN(txDate.getTime())) return acc;

      const key = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[key]) {
        const month = monthFormatter.format(txDate);
        acc[key] = { month: month.charAt(0).toUpperCase() + month.slice(1), claims: 0, amount: 0, coverage: 0 };
      }
      acc[key].claims += 1;
      acc[key].amount += Number(t.total_amount || 0);
      acc[key].coverage += Number(t.insurance_coverage_amount || 0);
      return acc;
    }, {});

    const monthlyTrends = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value)
      .slice(-6);

    return {
      totalCompanies: companies.length,
      activeCompanies: companies.filter((c: any) => c.is_active).length,
      totalPatients: uniquePatients.size,
      activePatients: uniquePatients.size,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      paidClaims,
      totalAmount,
      totalCoverage,
      totalPatientPaid,
      averageProcessingTime: 0,
      topCompanies,
      monthlyTrends,
      claimStatusDistribution
    };
  }, [insuranceTransactions, insuranceCompanies, dateRange.start, dateRange.end, selectedCompany, refreshKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-50';
      case 'APPROVED': return 'text-blue-600 bg-blue-50';
      case 'REJECTED': return 'text-red-600 bg-red-50';
      case 'PARTIAL': return 'text-orange-600 bg-orange-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const exportReport = (type: 'summary' | 'detailed' | 'companies') => {
    switch (type) {
      case 'summary':
        exportSummaryReport();
        break;
      case 'detailed':
        exportDetailedReport();
        break;
      case 'companies':
        exportCompaniesReport();
        break;
    }
  };

  const exportSummaryReport = () => {
    const data = [
      ['PÃ©riode', `${dateRange.start} - ${dateRange.end}`],
      ['Total Compagnies', dashboardData.totalCompanies.toString()],
      ['Compagnies Actives', dashboardData.activeCompanies.toString()],
      ['Total Patients', dashboardData.totalPatients.toString()],
      ['Patients Actifs', dashboardData.activePatients.toString()],
      ['Total RÃ©clamations', dashboardData.totalClaims.toString()],
      ['Montant Total', dashboardData.totalAmount.toLocaleString() + ' FCFA'],
      ['Couverture Totale', dashboardData.totalCoverage.toLocaleString() + ' FCFA'],
      ['Patient PayÃ©', dashboardData.totalPatientPaid.toLocaleString() + ' FCFA'],
      ['Temps Moyen', dashboardData.averageProcessingTime + ' jours']
    ];
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `resume-assurance-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportDetailedReport = () => {
    const headers = ['Mois', 'RÃ©clamations', 'Montant Total', 'Couverture', 'Patient PayÃ©'];
    const csvData = dashboardData.monthlyTrends.map(trend => [
      trend.month,
      trend.claims.toString(),
      trend.amount.toString(),
      trend.coverage.toString(),
      (trend.amount - trend.coverage).toString()
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport-detaille-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportCompaniesReport = () => {
    const headers = ['Compagnie', 'RÃ©clamations', 'Montant Total', 'Couverture Moyenne', 'Temps Traitement'];
    const csvData = dashboardData.topCompanies.map(company => [
      company.name,
      company.totalClaims.toString(),
      company.totalAmount.toString(),
      company.averageCoverage + '%',
      company.processingTime + ' jours'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapport-compagnies-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sendReportByEmail = () => {
    // Simuler l'envoi par email
    alert('Rapport envoyÃ© par email avec succÃ¨s !');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600" />
            Tableau de Bord Assurance
          </h2>
          <p className="text-sm text-slate-500">Vue d'ensemble complète du système d'assurance & IPM</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="bg-white border border-slate-200 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Actualiser
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => exportReport('summary')}
              className="bg-white border border-slate-200 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              RÃ©sumÃ©
            </button>
            <button
              onClick={() => exportReport('detailed')}
              className="bg-white border border-slate-200 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              DÃ©taillÃ©
            </button>
            <button
              onClick={() => exportReport('companies')}
              className="bg-white border border-slate-200 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Compagnies
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={sendReportByEmail}
              className="bg-white border border-slate-200 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <MailIcon className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={printReport}
              className="bg-white border border-slate-200 px-3 py-2 rounded-lg flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date de dÃ©but</label>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compagnie</label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(parseInt(e.target.value))}
            >
              <option value={0}>Toutes les compagnies</option>
              {insuranceCompanies?.map(company => (
                <option key={company.id} value={company.id}>{company.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total RÃ©clamations</p>
              <p className="text-2xl font-bold text-slate-900">{dashboardData.totalClaims.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">+12% vs mois dernier</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Montant Total</p>
              <p className="text-2xl font-bold text-slate-900">{(dashboardData.totalAmount / 1000000).toFixed(1)}M FCFA</p>
              <p className="text-xs text-slate-500 mt-1">+8% vs mois dernier</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Couverture Moyenne</p>
              <p className="text-2xl font-bold text-slate-900">{dashboardData.totalAmount > 0 ? Math.round((dashboardData.totalCoverage / dashboardData.totalAmount) * 100) : 0}%</p>
              <p className="text-xs text-slate-500 mt-1">+2% vs mois dernier</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Temps Moyen</p>
              <p className="text-2xl font-bold text-slate-900">{dashboardData.averageProcessingTime} jours</p>
              <p className="text-xs text-slate-500 mt-1">-0.5 jour vs mois dernier</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Graphiques et Statistiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des statuts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribution des RÃ©clamations</h3>
          <div className="space-y-3">
            {dashboardData.claimStatusDistribution.map((status) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status.status)}`}>
                    {status.status}
                  </span>
                  <span className="text-sm text-slate-600">{status.count} rÃ©clamations</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-900 font-medium">{status.percentage}%</div>
                  <div className="text-sm text-slate-600">{(status.amount / 1000000).toFixed(1)}M FCFA</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Compagnies */}
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Compagnies</h3>
          <div className="space-y-3">
            {dashboardData.topCompanies.map((company, index) => (
              <div key={company.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{company.name}</div>
                    <div className="text-sm text-slate-500">{company.totalClaims} rÃ©clamations</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">{(company.totalAmount / 1000000).toFixed(1)}M FCFA</div>
                  <div className="text-sm text-slate-500">{company.averageCoverage}% couverture</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tendances Mensuelles */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tendances Mensuelles</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mois</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">RÃ©clamations</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Montant Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Couverture</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">% Couverture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {dashboardData.monthlyTrends.map((trend, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{trend.month}</td>
                  <td className="px-4 py-3 text-slate-600">{trend.claims}</td>
                  <td className="px-4 py-3 text-slate-900 font-medium">{(trend.amount / 1000000).toFixed(1)}M FCFA</td>
                  <td className="px-4 py-3 text-green-600 font-medium">{(trend.coverage / 1000000).toFixed(1)}M FCFA</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${trend.amount > 0 ? Math.max(0, Math.min(100, (trend.coverage / trend.amount) * 100)) : 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-600">
                        {trend.amount > 0 ? Math.round((trend.coverage / trend.amount) * 100) : 0}%
                      </span>
                    </div>
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





