import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';

// Composant optimisé avec useMemo et useCallback
export const OptimizedDashboard: React.FC = () => {
  const { users, patients, services, tickets, medicines, consultations, sales } = useStore();
  
  // Utilisation de useMemo pour éviter les recalculs
  const stats = useMemo(() => ({
    totalPatients: patients?.length || 0,
    totalServices: services?.length || 0,
    totalTickets: tickets?.length || 0,
    totalMedicines: medicines?.length || 0,
    totalUsers: users?.length || 0,
    totalConsultations: consultations?.length || 0,
    totalSales: sales?.length || 0,
  }), [users, patients, services, tickets, medicines, consultations, sales]);

  // Évite les re-renders inutiles
  const recentActivity = useMemo(() => {
    const allItems = [
      ...(patients?.slice(-5).map(p => ({ ...p, type: 'patient', date: p.created_at })) || []),
      ...(tickets?.slice(-5).map(t => ({ ...t, type: 'ticket', date: t.created_at })) || []),
      ...(consultations?.slice(-5).map(c => ({ ...c, type: 'consultation', date: c.created_at })) || [])
    ];
    
    return allItems
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [patients, tickets, consultations]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Tableau de Bord</h1>
      
      {/* Stats Grid - Optimisé avec CSS Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Patients" value={stats.totalPatients} icon="👥" color="blue" />
        <StatCard title="Services" value={stats.totalServices} icon="🏥" color="green" />
        <StatCard title="Tickets" value={stats.totalTickets} icon="🎫" color="purple" />
        <StatCard title="Médicaments" value={stats.totalMedicines} icon="💊" color="orange" />
        <StatCard title="Utilisateurs" value={stats.totalUsers} icon="👤" color="pink" />
        <StatCard title="Consultations" value={stats.totalConsultations} icon="🩺" color="indigo" />
        <StatCard title="Ventes" value={stats.totalSales} icon="💰" color="teal" />
        <StatCard title="Centres" value={1} icon="🏢" color="red" />
      </div>

      {/* Recent Activity - Optimisé */}
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Activité Récente</h2>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <p className="text-slate-500">Aucune activité récente</p>
          ) : (
            recentActivity.map((item, index) => (
              <div key={`${item.type}-${item.id || index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {item.type === 'patient' ? '👥' : item.type === 'ticket' ? '🎫' : '🩺'}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.type === 'patient' ? `Patient: ${item.name || 'Nouveau'}` : 
                       item.type === 'ticket' ? `Ticket: ${item.reference || 'Nouveau'}` :
                       `Consultation: ${item.patient_id || 'Nouvelle'}`}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(item.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Composant StatCard optimisé
interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = React.memo(({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    pink: 'bg-pink-100 text-pink-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    teal: 'bg-teal-100 text-teal-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';
