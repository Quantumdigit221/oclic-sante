
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Download, TrendingUp, Activity, User, CreditCard } from 'lucide-react';

export const Reports = () => {
  const { tickets, sales, consultations, users } = useStore();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  // Vérifications de sécurité pour éviter les erreurs filter
  const ticketsList = Array.isArray(tickets) ? tickets : [];
  const salesList = Array.isArray(sales) ? sales : [];
  const consultationsList = Array.isArray(consultations) ? consultations : [];
  const usersList = Array.isArray(users) ? users : [];

  const now = new Date();
  
  // --- Data Filtering ---
  const getStartDate = () => {
    if (period === 'daily') return subDays(now, 1);
    if (period === 'monthly') return subDays(now, 30);
    return subDays(now, 7);
  };

  const startDate = getStartDate();

  const filteredTickets = useMemo(() => 
    ticketsList.filter(t => new Date(t.createdAt) >= startDate),
  [ticketsList, startDate]);

  const filteredSales = useMemo(() => 
    salesList.filter(s => new Date(s.createdAt) >= startDate),
  [salesList, startDate]);

  const filteredConsultations = useMemo(() => 
    consultationsList.filter(c => new Date(c.createdAt) >= startDate),
  [consultationsList, startDate]);

  // --- Chart 1: Revenue Evolution (Daily) ---
  const revenueChartData = useMemo(() => {
    const dataMap = new Map();
    const daysToProcess = period === 'monthly' ? 30 : (period === 'daily' ? 1 : 7);
    
    // Initialize days
    for (let i = daysToProcess - 1; i >= 0; i--) {
      const d = subDays(now, i);
      const label = format(d, 'dd MMM', { locale: fr });
      dataMap.set(label, { name: label, consultation: 0, pharmacy: 0 });
    }

    filteredTickets.forEach(t => {
      const label = format(new Date(t.createdAt), 'dd MMM', { locale: fr });
      if (dataMap.has(label)) dataMap.get(label).consultation += t.amount;
    });

    filteredSales.forEach(s => {
      const label = format(new Date(s.createdAt), 'dd MMM', { locale: fr });
      if (dataMap.has(label)) dataMap.get(label).pharmacy += s.totalAmount;
    });

    return Array.from(dataMap.values());
  }, [filteredTickets, filteredSales, period]);

  // --- Chart 2: Services Distribution (Pie) ---
  const servicePieData = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredTickets.forEach(t => {
      stats[t.serviceName] = (stats[t.serviceName] || 0) + 1;
    });
    return Object.keys(stats).map(name => ({ name, value: stats[name] })).sort((a,b) => b.value - a.value);
  }, [filteredTickets]);

  // --- Chart 3: Top Diagnoses (Epidemiology) ---
  const diagnosisData = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredConsultations.forEach(c => {
      const diag = c.diagnosis.trim();
      // Simple normalization
      const key = diag.charAt(0).toUpperCase() + diag.slice(1).toLowerCase();
      stats[key] = (stats[key] || 0) + 1;
    });
    return Object.keys(stats)
      .map(name => ({ name, count: stats[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  }, [filteredConsultations]);

  // --- Chart 4: Doctor Performance ---
  const doctorPerfData = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredTickets.forEach(t => {
      if (t.doctorId) {
        const docName = users.find(u => u.id === t.doctorId)?.name || 'Inconnu';
        stats[docName] = (stats[docName] || 0) + 1;
      }
    });
    return Object.keys(stats).map(name => ({ name, patients: stats[name] }));
  }, [filteredTickets, users]);

  // --- Chart 5: Payment Methods ---
  const paymentData = useMemo(() => {
    const stats = { 'Espèces': 0, 'Mobile Money': 0, 'Carte': 0 };
    
    const mapMethod = (m: string) => {
      if (m === 'MOBILE_MONEY') return 'Mobile Money';
      if (m === 'CARD') return 'Carte';
      return 'Espèces';
    };

    filteredTickets.forEach(t => {
      const key = mapMethod(t.paymentMethod);
      stats[key as keyof typeof stats] += t.amount;
    });
    filteredSales.forEach(s => {
      const key = mapMethod(s.paymentMethod);
      stats[key as keyof typeof stats] += s.totalAmount;
    });

    return Object.keys(stats).map(name => ({ name, value: stats[name as keyof typeof stats] }));
  }, [filteredTickets, filteredSales]);

  // --- Chart 6: Ticket Status ---
  const ticketStatusData = useMemo(() => {
    const stats: Record<string, number> = {};
    filteredTickets.forEach(t => {
      stats[t.status] = (stats[t.status] || 0) + 1;
    });
    return Object.keys(stats).map(name => ({ name, value: stats[name] }));
  }, [filteredTickets]);

  // --- Chart 7: Peak Hours (Hourly Traffic) ---
  const peakHourData = useMemo(() => {
    const stats = new Array(24).fill(0);
    filteredTickets.forEach(t => {
      const hour = new Date(t.createdAt).getHours();
      stats[hour]++;
    });
    return stats.map((count, hour) => ({ 
      hour: `${hour}h`, 
      count 
    }));
  }, [filteredTickets]);

  // --- Totals ---
  const totalTicketRevenue = filteredTickets.reduce((acc, t) => acc + parseFloat(String(t.amount || 0)), 0);
  const totalPharmaRevenue = filteredSales.reduce((acc, s) => acc + parseFloat(String(s.totalAmount || 0)), 0);
  const totalRevenue = totalTicketRevenue + totalPharmaRevenue;

  const COLORS = ['#0f766e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const PAYMENT_COLORS = ['#10b981', '#f97316', '#6366f1'];
  
  const STATUS_COLORS: Record<string, string> = {
    'En attente': '#f59e0b',
    'En cours': '#3b82f6',
    'Terminé': '#10b981',
    'Annulé': '#ef4444'
  };

  const handleExport = () => {
    // Simulation
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Type,Montant\n"
      + filteredTickets.map(t => `${t.createdAt},Consultation,${t.amount}`).join("\n")
      + "\n"
      + filteredSales.map(s => `${s.createdAt},Pharmacie,${s.totalAmount}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rapport_sante_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Rapports & Statistiques</h2>
          <p className="text-sm text-slate-500">Analyse détaillée de l'activité du centre</p>
        </div>
        
        <div className="flex gap-2">
           <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
              onClick={() => setPeriod('daily')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === 'daily' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              24h
            </button>
            <button 
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === 'weekly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              7 Jours
            </button>
            <button 
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === 'monthly' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
            >
              30 Jours
            </button>
          </div>
          <button 
            onClick={handleExport}
            className="bg-slate-200 text-slate-900 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-300 font-medium"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-slate-500">Revenu Total</p>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700"><TrendingUp className="w-4 h-4"/></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalRevenue.toLocaleString('fr-FR')} <span className="text-sm font-normal text-slate-500">FCFA</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
             <p className="text-sm font-medium text-slate-500">Consultations</p>
             <div className="p-2 bg-teal-100 rounded-lg text-teal-700"><Activity className="w-4 h-4"/></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{filteredTickets.length} <span className="text-sm font-normal text-slate-500">Patients</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
             <p className="text-sm font-medium text-slate-500">Pharmacie</p>
             <div className="p-2 bg-blue-100 rounded-lg text-blue-700"><CreditCard className="w-4 h-4"/></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{totalPharmaRevenue.toLocaleString()} <span className="text-sm font-normal text-slate-500">FCFA</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-2">
             <p className="text-sm font-medium text-slate-500">Consultations Méd.</p>
             <div className="p-2 bg-purple-100 rounded-lg text-purple-700"><User className="w-4 h-4"/></div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{filteredConsultations.length} <span className="text-sm font-normal text-slate-500">Effectuées</span></h3>
        </div>
      </div>

      {/* Row 1: Revenue & Epidemiology */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Évolution Financière</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`, '']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' }}
                  itemStyle={{ color: '#000' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="consultation" name="Consultations" fill="#0d9488" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pharmacy" name="Pharmacie" fill="#3b82f6" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Epidemiology Chart (Horizontal Bars) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top 5 Diagnostics</h3>
          {diagnosisData.length > 0 ? (
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diagnosisData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#334155', fontSize: 11, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20}>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm italic">
              Pas assez de données médicales
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Doctor Performance & Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Doctor Performance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Performance Médecins</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doctorPerfData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} axisLine={false} tickLine={false} tick={{fill: '#334155', fontSize: 11}} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' }} />
                  <Bar dataKey="patients" name="Patients" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </div>

        {/* Services Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Services Sollicités</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={servicePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {servicePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '11px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Modes de Paiement</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={80}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} FCFA`, '']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' }} 
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{fontSize: '11px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

       {/* Row 3: Operational Analysis (Status & Hours) */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Statuts des Tickets</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ticketStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ticketStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#cbd5e1'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Affluence par Heure</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHourData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#000' }}
                />
                <Bar dataKey="count" name="Patients" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
