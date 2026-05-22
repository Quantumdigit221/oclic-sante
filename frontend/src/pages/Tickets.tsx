import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { Plus, Search, Printer, User, Clock, CheckCircle, XCircle, FileText, QrCode, AlertTriangle } from 'lucide-react';
import { TicketStatus, Ticket, Role, Patient } from '../types';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MetricCard } from '../components/ui/Card';

// Guard contre les dates invalides ou absentes
const safeFormatDate = (dateVal: any, fmt: string): string => {
  if (!dateVal) return '--:--';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '--:--';
  try { return format(d, fmt, { locale: fr }); } catch { return '--:--'; }
};

export const Tickets = () => {
  const { tickets, services, users, patients, createTicket, updateTicketStatus, currentCenter, refreshTickets, patientInsurances, insuranceCompanies } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [printTicket, setPrintTicket] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  // Vérifications de sécurité pour éviter les erreurs filter
  const doctors = Array.isArray(users) ? users.filter(u => u.role === Role.DOCTOR) : [];
  const ticketsList = Array.isArray(tickets) ? tickets : [];
  const servicesList = Array.isArray(services) ? services : [];
  const patientsList = Array.isArray(patients) ? patients : [];

  // Form State
  const [formData, setFormData] = useState({
    patientName: '',
    patientAge: '',
    patientGender: 'F',
    patientPhone: '',
    patientAddress: '',
    serviceId: '',
    doctorId: '',
    paymentMethod: 'CASH',
    notes: '',
    insuranceId: '',
    insuranceCoverage: 0
  });
  const [selectedPatientInsurances, setSelectedPatientInsurances] = useState<any[]>([]);

  const getServiceId = (s: any): string => {
    if (!s) return '';
    if (typeof s === 'string') return s.trim();
    if (s && typeof s === 'object' && 'id' in s) {
      return s.id != null ? String(s.id).trim() : '';
    }
    return '';
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const selectedServicesList = servicesList.filter(s => selectedServices.includes(getServiceId(s)));
  // Éliminer les doublons dans les services sélectionnés
  const uniqueSelectedServices = [...new Set(selectedServices)];
  const uniqueSelectedServicesList = servicesList.filter(s => uniqueSelectedServices.includes(getServiceId(s)));
  const amount = uniqueSelectedServicesList.reduce((total, service) => {
    const servicePrice = parseFloat(String(service.price)) || 0;
    return total + servicePrice;
  }, 0);

  // Validation pour éviter NaN
  const safeAmount = isNaN(amount) ? 0 : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des champs requis
    if (!formData.patientName.trim()) {
      alert('Veuillez entrer le nom du patient');
      return;
    }

    if (!formData.patientAge || parseInt(formData.patientAge) <= 0) {
      alert('Veuillez entrer un âge valide');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Veuillez sélectionner au moins un service');
      return;
    }

    const selectedServicesList = servicesList.filter(s => selectedServices.includes(getServiceId(s)));

    try {
      // Utiliser les services uniques pour éviter les doublons
      const uniqueSelectedServices = [...new Set(selectedServices)];
      const uniqueSelectedServicesList = servicesList.filter(s => uniqueSelectedServices.includes(getServiceId(s)));

      console.log('Données du formulaire:', formData);
      console.log('Services sélectionnés (avec doublons):', selectedServices);
      console.log('Services sélectionnés (uniques):', uniqueSelectedServices);
      console.log('Liste des services à créer:', uniqueSelectedServicesList);

      // MODE TEST : Simulation sans appel API
      if (window.location.hostname === 'localhost' && (e.nativeEvent as any).shiftKey) {
        console.log('MODE TEST : Simulation de création de tickets');
        const mockTicket = {
          id: 'test-' + Date.now(),
          ticketNumber: 'TKT-' + Date.now(),
          patientName: formData.patientName,
          patientAge: parseInt(formData.patientAge),
          patientGender: formData.patientGender as 'M' | 'F',
          serviceName: uniqueSelectedServicesList.map(s => s.name).join(', '),
          amount: safeAmount,
          createdAt: new Date().toISOString(),
          status: 'WAITING' as const,
          centerId: currentCenter?.id || '1', // Utiliser l'ID numérique du center
          serviceId: '1', // Utiliser l'ID numérique du premier service
          paymentMethod: 'CASH' as const
        } as any;

        console.log('Ticket simulé créé:', mockTicket);
        setPrintTicket(mockTicket);
        alert('Mode TEST : Ticket simulé créé avec succès (maintenez Shift + Valider)');
        return;
      }

      // Créer UN SEUL ticket avec tous les services sélectionnés
      const ticketData = {
        centerId: currentCenter?.id || 'center-001',
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender as 'M' | 'F',
        patientPhone: formData.patientPhone,
        patientAddress: formData.patientAddress,
        // Utiliser le premier service comme service principal (pour la compatibilité)
        serviceId: getServiceId(uniqueSelectedServicesList[0]),
        serviceName: uniqueSelectedServicesList.map(s => s.name).join(' + '),
        amount: safeAmount,
        paymentMethod: formData.paymentMethod as any,
        doctorId: formData.doctorId,
        notes: formData.notes,
        status: 'WAITING',
        services: uniqueSelectedServicesList,
        insuranceId: formData.insuranceId,
        insuranceCoverage: formData.insuranceCoverage
      };

      console.log('Données du ticket unique à créer:', ticketData);

      const ticket = await createTicket(ticketData as any);

      if (ticket) {
        console.log('Ticket groupé créé avec succès:', ticket);
        setPrintTicket(ticket);
      } else {
        alert('Le ticket n\'a pu être créé');
        return;
      }
    } catch (error: any) {
      console.error('Erreur détaillée:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      console.error('Response headers:', error.response?.headers);

      if (error.response?.data?.message) {
        alert(`Erreur: ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors).flat().join('\n');
        alert(`Erreurs de validation:\n${errors}`);
      } else {
        alert(`Erreur lors de la création des tickets: ${error.message || 'Erreur inconnue'}`);
      }
      return;
    }

    setShowModal(false);
    setFormData({
      patientName: '', patientAge: '', patientGender: 'F', patientPhone: '', patientAddress: '',
      serviceId: '', doctorId: '', paymentMethod: 'CASH', notes: '', insuranceId: '', insuranceCoverage: 0
    });
    setSelectedServices([]);
    setServiceSearch('');
  };

  const filteredTickets = ticketsList.filter(t =>
    (t?.patientName || '').toLowerCase().includes((filter || '').toLowerCase()) ||
    (t?.ticketNumber || '').toLowerCase().includes((filter || '').toLowerCase())
  );

  const filteredPatients = patientSearch
    ? patientsList.filter(p =>
      (`${p?.firstName || ''} ${p?.lastName || ''}`).toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p?.phone || '').includes(patientSearch)
    )
    : [];

  const filteredServices = serviceSearch
    ? servicesList.filter(service => {
      const id = getServiceId(service);
      const isActive = service?.isActive !== false;
      const isValid = id !== '';
      const matchesSearch = (service?.name || '').toLowerCase().includes(serviceSearch.toLowerCase()) ||
        (service?.category || '').toLowerCase().includes(serviceSearch.toLowerCase());
      return isActive && isValid && (serviceSearch ? matchesSearch : true);
    })
    : servicesList.filter(service => {
      const id = getServiceId(service);
      const isActive = service?.isActive !== false;
      const isValid = id !== '';
      return isActive && isValid;
    });

  const handleSelectPatient = (patient: Patient) => {
    setFormData({
      ...formData,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientAge: differenceInYears(new Date(), new Date(patient.birthDate)).toString(),
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientAddress: patient.address,
    });
    setPatientSearch('');
    
    // Charger les assurances du patient
    const patientInsurancesList = patientInsurances.filter(i => String(i.patient_id) === String(patient.id));
    setSelectedPatientInsurances(patientInsurancesList);
    
    // Si une seule assurance primaire, la sélectionner par défaut
    const primary = patientInsurancesList.find(i => i.is_primary);
    if (primary) {
      setFormData(prev => ({ 
        ...prev, 
        insuranceId: primary.insurance_company_id,
        insuranceCoverage: primary.coverage_percentage || 0
      }));
    }
  };

  const handleSelectService = (service: any) => {
    const serviceId = getServiceId(service);

    if (selectedServices.includes(serviceId)) {
      // Désélectionner le service
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
      setServiceSearch(''); // Vider la recherche après désélection
    } else {
      // Sélectionner le service (éviter les doublons)
      setSelectedServices(prev => {
        const newSelection = [...prev];
        if (!newSelection.includes(serviceId)) {
          newSelection.push(serviceId);
        }
        return newSelection;
      });
      setServiceSearch(service.name);
      setShowServiceDropdown(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Tickets</h2>
          <p className="text-sm text-slate-500">File d'attente et facturation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshTickets}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
            title="Rafraîchir"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Nouveau Ticket
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <MetricCard
          title="En attente"
          value={ticketsList.filter(t => t.status === 'WAITING').length}
          icon={Clock}
          color="bg-amber-100"
        />
        <MetricCard
          title="En cours"
          value={ticketsList.filter(t => t.status === 'IN_PROGRESS').length}
          icon={User}
          color="bg-blue-100"
        />
        <MetricCard
          title="Terminés"
          value={ticketsList.filter(t => t.status === 'COMPLETED').length}
          icon={CheckCircle}
          color="bg-emerald-100"
        />
        <MetricCard
          title="Total Tickets"
          value={ticketsList.length}
          icon={FileText}
          color="bg-slate-100"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un patient ou n° ticket..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">N° Ticket</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Patient</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Service</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Heure</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{ticket.ticketNumber}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                        {ticket.patientGender}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{ticket.patientName}</p>
                        <p className="text-xs text-slate-500">{ticket.patientAge} ans</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {ticket.serviceName}
                    {ticket.doctorId && <div className="text-xs text-slate-400 mt-1">Dr. {users.find(u => u.id === ticket.doctorId)?.name}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${ticket.status === 'WAITING' ? 'bg-amber-100 text-amber-800' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          ticket.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-800'
                      }
                    `}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {safeFormatDate(ticket.createdAt, 'HH:mm')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPrintTicket(ticket)}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                        title="Imprimer ticket"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          // Naviguer vers les détails du ticket/patient
                          // Pour l'instant, afficher une alerte avec les détails
                          alert(`Détails du ticket:\n\nNuméro: ${ticket.ticketNumber}\nPatient: ${ticket.patientName}\nService: ${ticket.serviceName}\nStatut: ${ticket.status}\nMontant: ${formatAmount(ticket.amount)} FCFA`);
                        }}
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                        title="Voir détails"
                      >
                        <FileText className="w-4 h-4" />
                      </button>

                      {ticket.status === 'WAITING' && (
                        <>
                          <button
                            onClick={async () => await updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Démarrer consultation"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"
                            title="Assigner à un médecin"
                          >
                            <User className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {ticket.status === 'IN_PROGRESS' && (
                        <>
                          <button
                            onClick={async () => await updateTicketStatus(ticket.id, 'COMPLETED')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                            title="Terminer consultation"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => await updateTicketStatus(ticket.id, 'WAITING')}
                            className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg"
                            title="Remettre en attente"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {ticket.status !== 'COMPLETED' && (
                        <button
                          onClick={async () => {
                            if (confirm(`Êtes-vous sûr de vouloir annuler le ticket ${ticket.ticketNumber} ?`)) {
                              await updateTicketStatus(ticket.id, 'CANCELLED');
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Annuler ticket"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              Aucun ticket trouvé.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-900">Nouveau Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Informations Patient</h4>
                </div>
                <div className="col-span-1 md:col-span-2 relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rechercher un patient</label>
                  <input
                    type="text"
                    placeholder="Taper le nom ou le téléphone..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={patientSearch}
                    onChange={e => setPatientSearch(e.target.value)}
                  />
                  {filteredPatients.length > 0 && (
                    <div className="absolute z-10 w-full bg-white mt-1 border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredPatients.map(p => (
                        <div
                          key={p.id}
                          className="p-2 hover:bg-teal-50 cursor-pointer text-sm border-b border-slate-50 last:border-0"
                          onClick={() => handleSelectPatient(p)}
                        >
                          <div className="font-bold text-slate-800">{p.firstName} {p.lastName}</div>
                          <div className="text-xs text-slate-500">{p.phone}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50"
                    value={formData.patientName}
                    onChange={e => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Âge</label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.patientAge}
                    onChange={e => setFormData({ ...formData, patientAge: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.patientGender}
                    onChange={e => setFormData({ ...formData, patientGender: e.target.value })}
                  >
                    <option value="F">Féminin</option>
                    <option value="M">Masculin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.patientPhone}
                    onChange={e => setFormData({ ...formData, patientPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.patientAddress}
                    onChange={e => setFormData({ ...formData, patientAddress: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 pt-2">
                  <h4 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">Services & Paiement</h4>
                </div>

                <div className="col-span-1 md:col-span-2 relative" ref={serviceDropdownRef}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Services Demandés</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Rechercher des services..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                      value={serviceSearch}
                      onChange={e => {
                        setServiceSearch(e.target.value);
                        setShowServiceDropdown(true);
                      }}
                      onFocus={() => setShowServiceDropdown(true)}
                    />
                    {showServiceDropdown && (
                      <div className="absolute z-10 w-full bg-white mt-1 border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredServices.map((service, index) => {
                          const serviceId = getServiceId(service);
                          const isSelected = selectedServices.includes(serviceId);
                          return (
                            <div
                              key={`${serviceId}-${index}`}
                              className={`p-3 hover:bg-teal-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${isSelected ? 'bg-teal-100' : ''}`}
                              onClick={() => handleSelectService(service)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleSelectService(service)}
                                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                  />
                                  <div className="font-medium text-slate-800">{service.name}</div>
                                </div>
                                <div className="text-sm text-slate-600">
                                  {service.price} FCFA
                                  {service.emergencyPrice && (
                                    <span className="text-amber-600 ml-2">
                                      (Urgence: {service.emergencyPrice} FCFA)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                Catégorie: {service.category}
                                {service.durationMinutes && (
                                  <span className="ml-2">
                                    Durée: {service.durationMinutes} min
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {filteredServices.length === 0 && serviceSearch && (
                          <div className="p-3 text-slate-500 text-sm">
                            Aucun service trouvé pour "{serviceSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Services sélectionnés */}
                  {selectedServices.length > 0 && (
                    <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-teal-800">Services sélectionnés ({selectedServices.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedServices([]);
                            setServiceSearch('');
                          }}
                          className="text-sm text-teal-600 hover:text-teal-700 underline"
                        >
                          Vider tout
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedServices.map(serviceId => {
                          const service = services.find(s => getServiceId(s) === serviceId);
                          return (
                            <div
                              key={serviceId}
                              className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-teal-300 text-sm"
                            >
                              <span className="font-medium text-slate-700">{service?.name}</span>
                              <button
                                type="button"
                                onClick={() => handleSelectService(service)}
                                className="text-teal-600 hover:text-teal-700 ml-1"
                                title="Retirer"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Médecin (Optionnel)</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.doctorId}
                    onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                  >
                    <option value="">-- Aucun --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.name} ({d.specialty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mode de Paiement</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  >
                    <option value="CASH">Espèces</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="CARD">Carte Bancaire</option>
                  </select>
                </div>
              </div>

              {selectedPatientInsurances.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Assurances du Patient
                  </h4>
                  <div className="space-y-2">
                    {selectedPatientInsurances.map(ins => (
                      <div 
                        key={ins.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${formData.insuranceId === ins.insurance_company_id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-blue-100 text-blue-900 hover:border-blue-300'}`}
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          insuranceId: prev.insuranceId === ins.insurance_company_id ? '' : ins.insurance_company_id,
                          insuranceCoverage: prev.insuranceId === ins.insurance_company_id ? 0 : (ins.coverage_percentage || 0)
                        }))}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{ins.company_name}</span>
                          <span className="text-xs font-bold">{ins.coverage_percentage}% de couverture</span>
                        </div>
                        <div className={`text-[10px] mt-1 ${formData.insuranceId === ins.insurance_company_id ? 'text-blue-100' : 'text-slate-500'}`}>
                          N° Carte: {ins.member_number || 'Non renseigné'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.insuranceId && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex justify-between items-center">
                  <div className="text-sm text-emerald-800">
                    <span className="font-bold">Couverture Assurance:</span>
                    <p className="text-xs">Prise en charge de {formData.insuranceCoverage}%</p>
                  </div>
                  <div className="text-sm text-emerald-800 text-right">
                    <span className="font-bold">-{formatAmount((safeAmount * formData.insuranceCoverage) / 100)}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                <div>
                  <span className="text-sm font-medium text-slate-600 block">Total à payer</span>
                  {formData.insuranceId && <span className="text-[10px] text-slate-400 leading-none">Net après assurance</span>}
                </div>
                <span className="text-xl font-bold text-teal-700">
                  {formatAmount(formData.insuranceId ? (safeAmount * (1 - formData.insuranceCoverage / 100)) : safeAmount)}
                </span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-teal-400 text-slate-900 rounded-lg hover:bg-teal-500 font-medium shadow-sm"
                >
                  Valider & Imprimer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Print Modal (80mm Thermal Receipt Style) */}
      {printTicket && (
        <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="overflow-y-auto p-4 flex justify-center bg-slate-100">
              {/* Receipt Container */}
              <div id="print-area" className="bg-white w-[302px] p-6 text-black font-mono text-sm shadow-md">
                {/* Header */}
                <div className="text-center border-b-2 border-black pb-4 mb-4">
                  <div className="font-black text-xl uppercase leading-tight text-black">{currentCenter?.name}</div>
                  <div className="text-xs font-medium text-black mt-2">
                    DATE: {safeFormatDate(printTicket.createdAt, 'dd/MM/yyyy HH:mm')}
                  </div>
                </div>

                {/* Patient */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase text-black">Patient :</div>
                  <div className="text-lg font-black uppercase text-black">{printTicket.patientName}</div>
                </div>

                {/* Services */}
                <div className="border-t border-b-2 border-black py-4 mb-4">
                  <div className="font-black text-xs mb-3 underline uppercase">Prestations :</div>
                  <div className="space-y-3">
                    {Array.isArray(printTicket.services) && printTicket.services.length > 0 ? (
                      printTicket.services.map((s, index) => (
                        <div key={index} className="flex justify-between items-start gap-4">
                          <span className="flex-1 font-bold leading-tight">{s.name}</span>
                          <span className="font-black whitespace-nowrap">{formatAmount(parseFloat(String(s.price || s.amount || 0)))}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-start gap-4">
                        <span className="flex-1 font-bold leading-tight">{printTicket.serviceName}</span>
                        <span className="font-black">{formatAmount(printTicket.amount || 0)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-black">
                    <span className="font-black text-xs">TOTAL À PAYER :</span>
                    <span className="text-xl font-black">{formatAmount(printTicket.amount || 0)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t-4 border-double border-black pt-3 text-black">
                    <span className="font-black text-xs">MONTANT PAYÉ :</span>
                    <span className="text-xl font-black">{formatAmount(printTicket.amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex gap-3 no-print">
              <button
                type="button"
                onClick={() => setPrintTicket(null)}
                className="flex-1 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Impression du ticket:', printTicket);
                  window.print();
                }}
                className="flex-1 py-2 bg-slate-900 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
