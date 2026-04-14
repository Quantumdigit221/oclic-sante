import React from 'react';
import { useStore } from '../store';
import { 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TicketStatus } from '../types';
import { StatCard, Card } from '../components/ui/Card';

export const Dashboard = () => {
  const { tickets, sales, medicines } = useStore();

  // Stats Logic - Ajout de vérifications de sécurité
  const today = new Date();
  const ticketsArray = Array.isArray(tickets) ? tickets : [];
  const salesArray = Array.isArray(sales) ? sales : [];
  const medicinesArray = Array.isArray(medicines) ? medicines : [];
  
  const ticketsToday = ticketsArray.filter(t => isSameDay(new Date(t.createdAt), today));
  const incomeToday = ticketsToday.reduce((sum, t) => sum + Number(t.amount || 0), 0) + 
                      salesArray.filter(s => isSameDay(new Date(s.createdAt), today)).reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
  
  const lowStockCount = medicinesArray.filter(m => m.stock <= m.minStock).length;
  const waitingPatients = ticketsArray.filter(t => t.status === 'WAITING').length;

  // Chart Data Preparation (Last 7 days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(today, 6 - i);
    const dayTickets = ticketsArray.filter(t => isSameDay(new Date(t.createdAt), date));
    return {
      name: format(date, 'EEE', { locale: fr }),
      patients: dayTickets.length,
      revenue: dayTickets.reduce((sum, t) => sum + Number(t.amount || 0), 0),
    };
  });

  // S'assurer que chartData n'est jamais vide pour éviter les erreurs de dimensions
  const safeChartData = chartData.length > 0 ? chartData : [
    { name: 'Lun', patients: 0, revenue: 0 },
    { name: 'Mar', patients: 0, revenue: 0 },
    { name: 'Mer', patients: 0, revenue: 0 },
    { name: 'Jeu', patients: 0, revenue: 0 },
    { name: 'Ven', patients: 0, revenue: 0 },
    { name: 'Sam', patients: 0, revenue: 0 },
    { name: 'Dim', patients: 0, revenue: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Tableau de bord</h2>
        <div className="text-sm text-slate-500">
          {format(today, 'PPPP', { locale: fr })}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard 
          title="Patients Aujourd'hui" 
          value={ticketsToday.length} 
          icon={Users} 
          trend={ticketsToday.length > 0 ? "+12%" : "0%"} 
          trendType={ticketsToday.length > 0 ? "up" : "neutral"}
          iconColor="bg-blue-100"
          size="lg"
        />
        <StatCard 
          title="Revenus du Jour" 
          value={`${incomeToday} FCFA`} 
          icon={CreditCard} 
          trend={incomeToday > 0 ? "+5%" : "0%"} 
          trendType={incomeToday > 0 ? "up" : "neutral"}
          iconColor="bg-emerald-100"
          size="lg"
        />
        <StatCard 
          title="En salle d'attente" 
          value={waitingPatients} 
          icon={Activity} 
          trend="Stable" 
          trendType="neutral"
          iconColor="bg-amber-100"
          size="lg"
        />
        <StatCard 
          title="Stock Critique" 
          value={lowStockCount} 
          icon={AlertCircle} 
          trend="Action requise" 
          trendType="warning"
          iconColor="bg-red-100"
          size="lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-teal-600 rounded-full mr-3"></div>
            Affluence Patients (7 jours)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height={288}>
              <AreaChart data={safeChartData}>
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="patients" 
                  stroke="#0f766e" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorPatients)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
            Revenus (7 jours)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height={288}>
              <BarChart data={safeChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  formatter={(value: number) => [`${value} FCFA`, 'Revenu']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
