import React, { useState } from 'react';
import { useStore } from '../store';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  Clock, 
  User, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Filter
} from 'lucide-react';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '../components/ui/Card';
import { AppointmentStatus } from '../types';

export const Appointments: React.FC = () => {
  const { appointments, patients, users, services, createAppointment, addPatient, refreshAppointments, isLoading } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [customerSearch, setCustomerSearch] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);

  const [newAppt, setNewAppt] = useState({
    patientName: '',
    patientPhone: '',
    patientId: '',
    appointmentDate: format(new Date(), 'yyyy-MM-dd'),
    appointmentTime: '09:00',
    reason: '',
    doctorId: '',
    serviceId: ''
  });

  const doctors = users.filter(u => u.role === 'DOCTOR' || u.role === 'ADMIN');
  const activeServices = services.filter(s => s.isActive);

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(customerSearch.toLowerCase()) ||
    p.phone?.includes(customerSearch)
  ).slice(0, 5);

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || appt.status === filterStatus;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime() - new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-create patient logic
    let targetPatientId = newAppt.patientId;
    let targetPatientName = newAppt.patientName || customerSearch;

    if (!targetPatientId && targetPatientName) {
      const nameParts = targetPatientName.split(' ');
      const firstName = nameParts[0] || 'Inconnu';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const existingPatient = patients.find(p => 
        p.firstName.toLowerCase() === firstName.toLowerCase() && 
        p.lastName.toLowerCase() === lastName.toLowerCase()
      );

      if (!existingPatient) {
        // Create new patient silently
        targetPatientId = `P-${Date.now()}`;
        await addPatient({
          firstName,
          lastName,
          phone: newAppt.patientPhone,
          address: '',
          gender: 'M',
          birthDate: new Date().toISOString().split('T')[0]
        });
      } else {
        targetPatientId = existingPatient.id;
      }
    }

    const doctor = users.find(u => u.id === newAppt.doctorId);

    const apptData = {
      ...newAppt,
      patientName: targetPatientName,
      patientId: targetPatientId,
      doctorName: doctor ? doctor.name : undefined
    };

    const success = await createAppointment(apptData);
    if (success) {
      setIsModalOpen(false);
      setNewAppt({
        patientName: '',
        patientPhone: '',
        patientId: '',
        appointmentDate: format(new Date(), 'yyyy-MM-dd'),
        appointmentTime: '09:00',
        reason: '',
        doctorId: '',
        serviceId: ''
      });
      setCustomerSearch('');
      refreshAppointments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'COMPLETED': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CANCELLED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-teal-600" />
            Gestion des Rendez-vous
          </h1>
          <p className="text-slate-500 mt-1">Planifiez et suivez les consultations de vos patients.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl shadow-sm transition-all duration-200 font-medium whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Nouveau Rendez-vous
        </button>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="SCHEDULED">Planifiés</option>
            <option value="CONFIRMED">Confirmés</option>
            <option value="COMPLETED">Terminés</option>
            <option value="CANCELLED">Annulés</option>
          </select>
        </div>
        <div className="flex items-center justify-end">
           <button 
             onClick={() => refreshAppointments()}
             className="text-sm text-teal-600 hover:text-teal-700 font-medium"
           >
             Mettre à jour la liste
           </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
            <p className="text-slate-500 font-medium">Chargement des rendez-vous...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          filteredAppointments.map((appt) => (
            <Card key={appt.id} className="hover:shadow-md transition-shadow cursor-default group">
              <div className="flex flex-col md:flex-row md:items-center justify-between p-2 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                      {format(parseISO(appt.appointmentDate), 'MMM', { locale: fr })}
                    </span>
                    <span className="text-lg font-black text-slate-700 leading-none">
                      {format(parseISO(appt.appointmentDate), 'dd')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="font-bold text-slate-900">{appt.patientName}</h3>
                       <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(appt.status)}`}>
                         {appt.status}
                       </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />
                        {appt.appointmentTime}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        {appt.patientPhone}
                      </div>
                      {appt.smsSent && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <MessageSquare className="w-3.5 h-3.5" />
                          SMS Envoyé
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end md:self-center">
                   {appt.status === 'SCHEDULED' && (
                     <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Confirmer">
                       <CheckCircle2 className="w-5 h-5" />
                     </button>
                   )}
                   <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                     <XCircle className="w-5 h-5" />
                   </button>
                   <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                     <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Aucun rendez-vous</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Il n'y a pas de rendez-vous correspondant à vos critères de recherche.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-bold"
            >
              <Plus className="w-5 h-5" />
              Prendre le premier rendez-vous
            </button>
          </div>
        )}
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-white/20">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6" />
                  Nouveau Rendez-vous
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-teal-50 mt-1 text-sm opacity-90">Remplissez les informations du patient ci-dessous.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Nom du Patient</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                      placeholder="Ex: Jean Dupont"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setNewAppt({...newAppt, patientName: e.target.value, patientId: ''});
                        setShowPatientList(true);
                      }}
                      onFocus={() => setShowPatientList(true)}
                      onBlur={() => setTimeout(() => setShowPatientList(false), 200)}
                    />
                    {showPatientList && customerSearch && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                        {filteredPatients.length > 0 ? (
                          filteredPatients.map(p => (
                            <button
                              key={p.id}
                              type="button"
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                              onMouseDown={() => {
                                setCustomerSearch(`${p.firstName} ${p.lastName}`);
                                setNewAppt({...newAppt, patientName: `${p.firstName} ${p.lastName}`, patientId: p.id, patientPhone: p.phone || newAppt.patientPhone});
                                setShowPatientList(false);
                              }}
                            >
                              <div className="font-bold text-slate-900 text-sm">{p.firstName} {p.lastName}</div>
                              <div className="text-xs text-slate-500">{p.phone}</div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            Aucun patient trouvé. <br/>
                            <span className="text-teal-600 font-medium">Un nouveau dossier sera créé.</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none"
                      placeholder="Ex: +221 77..."
                      value={newAppt.patientPhone}
                      onChange={(e) => setNewAppt({...newAppt, patientPhone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Médecin</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none"
                    value={newAppt.doctorId}
                    required
                    onChange={(e) => setNewAppt({...newAppt, doctorId: e.target.value})}
                  >
                    <option value="">Sélectionner un médecin</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name} {doc.specialty ? `(${doc.specialty})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Cibler un Service</label>
                  <select
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none"
                    value={newAppt.serviceId}
                    onChange={(e) => setNewAppt({...newAppt, serviceId: e.target.value})}
                  >
                    <option value="">Aucun / Général</option>
                    {activeServices.map(svc => (
                      <option key={svc.id} value={svc.id}>{svc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none"
                    value={newAppt.appointmentDate}
                    onChange={(e) => setNewAppt({...newAppt, appointmentDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Heure</label>
                  <input
                    type="time"
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none"
                    value={newAppt.appointmentTime}
                    onChange={(e) => setNewAppt({...newAppt, appointmentTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Motif (Optionnel)</label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none resize-none h-24"
                  placeholder="Ex: Consultation de routine"
                  value={newAppt.reason}
                  onChange={(e) => setNewAppt({...newAppt, reason: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 shadow-md shadow-teal-200 transition-all active:scale-[0.98]"
                >
                  Confirmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
