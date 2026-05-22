// Composant Tickets pour l'architecture monolithique
// Inspiré du code React original mais adapté pour Node.js/Express

import React, { useEffect, useState, useRef } from 'react';
import { Plus, Search, Printer, User, Clock, CheckCircle, XCircle, FileText, QrCode, AlertTriangle } from 'lucide-react';

export const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [currentCenter, setCurrentCenter] = useState({
    id: 'center-1',
    name: 'Centre Médical O\'CLIC SANTE',
    address: '123 Rue de la Santé, Dakar, Sénégal',
    phone: '+221 33 123 45 67',
    email: 'contact@sante.quantum221.com',
    rnis: 'RNIS-001',
    pispiAlias: 'OCLIC-SANTE'
  });

  // États du composant
  const [showModal, setShowModal] = useState(false);
  const [printTicket, setPrintTicket] = useState(null);
  const [filter, setFilter] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const serviceDropdownRef = useRef(null);

  // Données du formulaire
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
    patientId: ''
  });

  const [insurances, setInsurances] = useState([]);
  const [patientInsurances, setPatientInsurances] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  // Charger les données depuis l'API locale
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger toutes les données depuis l'API monolithique
      const [ticketsRes, servicesRes, usersRes, patientsRes] = await Promise.all([
        fetch('/api/tickets').then(r => r.json()),
        fetch('/api/services').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/patients').then(r => r.json())
      ]);

      setTickets(ticketsRes.tickets || []);
      setServices(servicesRes.services || []);
      setUsers(usersRes.users || []);
      setPatients(patientsRes.patients || []);
      
      // Charger les compagnies et polices d'assurance
      const [insurancesRes, policesRes] = await Promise.all([
        fetch('/api/insurance-companies').then(r => r.json()),
        fetch('/api/patient-insurances').then(r => r.json())
      ]);
      setInsurances(insurancesRes || []);
      setPatientInsurances(policesRes || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      // Utiliser les données par défaut si l'API n'est pas disponible
      setDefaultData();
    }
  };

  const setDefaultData = () => {
    // Données par défaut pour le mode démo
    setTickets([
      {
        id: 'ticket-001',
        ticketNumber: 'TKT-20240315-001',
        patientName: 'Patient Test',
        patientAge: 35,
        patientGender: 'M',
        serviceName: 'Consultation générale',
        status: 'WAITING',
        amount: 5000,
        createdAt: new Date().toISOString()
      }
    ]);

    setServices([
      {
        id: 'service-001',
        name: 'Consultation générale',
        category: 'Consultation',
        price: 5000,
        emergencyPrice: 7500,
        isActive: true
      },
      {
        id: 'service-002',
        name: 'Consultation pédiatrique',
        category: 'Consultation',
        price: 6000,
        emergencyPrice: 9000,
        isActive: true
      }
    ]);

    setUsers([
      {
        id: 'user-001',
        name: 'Dr. Administrateur',
        role: 'DOCTOR',
        specialty: 'Médecine générale'
      }
    ]);
  };

  const getServiceId = (s) => {
    if (!s) return '';
    if (typeof s === 'string') return s.trim();
    if (s && typeof s === 'object' && 'id' in s) {
      return s.id != null ? String(s.id).trim() : '';
    }
    return '';
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount || 0);
  };

  const format = (date, formatStr) => {
    const d = new Date(date);
    if (formatStr === 'HH:mm') {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    if (formatStr === 'dd/MM/yyyy HH:mm') {
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return d.toLocaleDateString('fr-FR');
  };

  const createTicket = async (ticketData) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      });

      if (response.ok) {
        const newTicket = await response.json();
        setTickets(prev => [...prev, newTicket]);
        return newTicket;
      }
      throw new Error('Erreur création ticket');
    } catch (error) {
      console.error('Erreur:', error);
      // Simulation pour le mode démo
      const mockTicket = {
        ...ticketData,
        id: 'ticket-' + Date.now(),
        ticketNumber: 'TKT-' + Date.now(),
        createdAt: new Date().toISOString()
      };
      setTickets(prev => [...prev, mockTicket]);
      return mockTicket;
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setTickets(prev => prev.map(t =>
          t.id === ticketId ? { ...t, status: newStatus } : t
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
      // Simulation pour le mode démo
      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    try {
      const uniqueSelectedServices = [...new Set(selectedServices)];
      const uniqueSelectedServicesList = services.filter(s =>
        uniqueSelectedServices.includes(getServiceId(s))
      );

      const totalAmt = uniqueSelectedServicesList.reduce((total, service) => {
        const servicePrice = parseFloat(String(service.price)) || 0;
        return total + servicePrice;
      }, 0);
      
      // Trouver la couverture d'assurance
      let coverage = 0;
      if (formData.insuranceId) {
        const policy = patientInsurances.find(pi => 
          String(pi.insurance_company_id) === String(formData.insuranceId) && 
          (String(pi.patient_id) === String(formData.patientId) || pi.patient_name === formData.patientName)
        );
        coverage = policy ? parseFloat(policy.coverage_percentage || 0) : 0;
        
        // Si pas de police spécifique, utiliser celle de la compagnie
        if (coverage === 0) {
          const company = insurances.find(c => String(c.id) === String(formData.insuranceId));
          coverage = company ? parseFloat(company.coverage_percentage || 0) : 0;
        }
      }

      const servicesPayload = uniqueSelectedServicesList.map(service => ({
        id: getServiceId(service),
        name: service.name,
        price: parseFloat(String(service.price)) || 0
      }));

      const ticketData = {
        centerId: currentCenter.id,
        patient_id: formData.patientId || null,
        patientName: formData.patientName,
        patientAge: parseInt(formData.patientAge),
        patientGender: formData.patientGender,
        patientPhone: formData.patientPhone,
        patientAddress: formData.patientAddress,
        services: servicesPayload,
        amount: totalAmt,
        paymentMethod: formData.paymentMethod,
        doctorId: formData.doctorId,
        notes: formData.notes,
        insuranceId: formData.insuranceId || null,
        insuranceCoverage: coverage,
        claimReference: formData.claimReference || '',
        status: 'WAITING'
      };

      const ticket = await createTicket(ticketData);
      if (ticket) {
        setPrintTicket(ticket);
        if (servicesPayload.length > 1) {
          alert(`1 ticket créé avec ${servicesPayload.length} services.`);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création des tickets');
      return;
    }

    // Réinitialiser le formulaire
    setShowModal(false);
    setFormData({
      patientName: '', patientAge: '', patientGender: 'F', patientPhone: '',
      patientAddress: '', serviceId: '', doctorId: '', paymentMethod: 'CASH', notes: ''
    });
    setSelectedServices([]);
    setServiceSearch('');
  };

  const filteredTickets = tickets.filter(t =>
    (t?.patientName || '').toLowerCase().includes((filter || '').toLowerCase()) ||
    (t?.ticketNumber || '').toLowerCase().includes((filter || '').toLowerCase())
  );

  const filteredPatients = patientSearch
    ? patients.filter(p =>
      (`${p?.firstName || ''} ${p?.lastName || ''}`).toLowerCase().includes(patientSearch.toLowerCase()) ||
      (p?.phone || '').includes(patientSearch)
    )
    : [];

  const filteredServices = serviceSearch
    ? services.filter(service => {
      const id = getServiceId(service);
      const isActive = service?.isActive !== false;
      const isValid = id !== '';
      const matchesSearch = (service?.name?.toLowerCase().includes(serviceSearch.toLowerCase()) ||
        service?.category?.toLowerCase().includes(serviceSearch.toLowerCase()));
      return isActive && isValid && (serviceSearch ? matchesSearch : true);
    })
    : services.filter(service => {
      const id = getServiceId(service);
      const isActive = service?.isActive !== false;
      const isValid = id !== '';
      return isActive && isValid;
    });

  const handleSelectPatient = (patient) => {
    setFormData({
      ...formData,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientAge: String(new Date().getFullYear() - new Date(patient.birthDate).getFullYear()),
      patientGender: patient.gender,
      patientPhone: patient.phone,
      patientAddress: patient.address,
    });
    setPatientSearch('');
  };

  const handleSelectService = (service) => {
    const serviceId = getServiceId(service);

    if (selectedServices.includes(serviceId)) {
      setSelectedServices(prev => prev.filter(id => id !== serviceId));
      setServiceSearch('');
    } else {
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

  const selectedServicesList = services.filter(s => selectedServices.includes(getServiceId(s)));
  const uniqueSelectedServices = [...new Set(selectedServices)];
  const uniqueSelectedServicesList = services.filter(s => uniqueSelectedServices.includes(getServiceId(s)));
  const amount = uniqueSelectedServicesList.reduce((total, service) => {
    const servicePrice = parseFloat(String(service.price)) || 0;
    return total + servicePrice;
  }, 0);
  const safeAmount = isNaN(amount) ? 0 : amount;

  // Composants UI simplifiés
  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className={`${color} p-4 rounded-xl border border-slate-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestion des Tickets</h2>
          <p className="text-sm text-slate-500">File d'attente et facturation</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
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
      <div className="grid grid-cols-4 gap-6">
        <MetricCard
          title="En attente"
          value={tickets.filter(t => t.status === 'WAITING').length}
          icon={Clock}
          color="bg-amber-100"
        />
        <MetricCard
          title="En cours"
          value={tickets.filter(t => t.status === 'IN_PROGRESS').length}
          icon={User}
          color="bg-blue-100"
        />
        <MetricCard
          title="Terminés"
          value={tickets.filter(t => t.status === 'COMPLETED').length}
          icon={CheckCircle}
          color="bg-emerald-100"
        />
        <MetricCard
          title="Total Tickets"
          value={tickets.length}
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
          <table className="w-full text-left border-collapse">
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
                  <td className="px-6 py-4 text-sm text-slate-600">{ticket.serviceName}</td>
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
                    {format(new Date(ticket.createdAt), 'HH:mm')}
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
                      {ticket.status === 'WAITING' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS')}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Démarrer consultation"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                      {ticket.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => updateTicketStatus(ticket.id, 'COMPLETED')}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Terminer consultation"
                        >
                          <CheckCircle className="w-4 h-4" />
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

      {/* Modal Nouveau Ticket */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nouveau Ticket Médical</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informations Patient */}
              <section>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Patient</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nom du Patient *</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                        placeholder="Chercher ou saisir un nom..."
                        value={formData.patientName}
                        onChange={(e) => {
                          setFormData({ ...formData, patientName: e.target.value });
                          setPatientSearch(e.target.value);
                        }}
                        autoComplete="off"
                      />
                      <User className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
                    </div>
                    {filteredPatients.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredPatients.map(p => (
                          <div
                            key={p.id}
                            className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0"
                            onClick={() => handleSelectPatient(p)}
                          >
                            <span className="font-bold">{p.firstName} {p.lastName}</span>
                            <span className="text-xs text-slate-400 ml-2">{p.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Âge *</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Genre *</label>
                    <select
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                    >
                      <option value="M">Masculin (M)</option>
                      <option value="F">Féminin (F)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Sélection Services */}
              <section>
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Services & Facturation</h4>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Ajouter des services *</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="Rechercher un service (Consultation...)"
                        value={serviceSearch}
                        onChange={(e) => {
                          setServiceSearch(e.target.value);
                          setShowServiceDropdown(true);
                        }}
                        onFocus={() => setShowServiceDropdown(true)}
                      />
                      <Search className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" />
                    </div>
                    {showServiceDropdown && filteredServices.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                        {filteredServices.map(s => (
                          <div
                            key={getServiceId(s)}
                            className="p-3 hover:bg-teal-50 cursor-pointer border-b border-slate-50 flex justify-between items-center"
                            onClick={() => handleSelectService(s)}
                          >
                            <span className="font-semibold">{s.name}</span>
                            <span className="text-teal-600 font-bold">{formatAmount(s.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Liste des services sélectionnés */}
                  {selectedServicesList.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-2">
                      {selectedServicesList.map(s => (
                        <div key={getServiceId(s)} className="bg-white px-3 py-1.5 rounded-full border border-teal-200 text-teal-800 text-xs font-bold flex items-center gap-2">
                          {s.name} - {formatAmount(s.price)}
                          <button type="button" onClick={() => handleSelectService(s)} className="text-teal-400 hover:text-teal-600">×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Méthode de Paiement</label>
                      <select
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      >
                        <option value="CASH">Espèces (Cash)</option>
                        <option value="MOBILE">Mobile Money</option>
                        <option value="CARD">Carte Bancaire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Assurance / IPM (Facultatif)</label>
                      <select
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-300 bg-white"
                        value={formData.insuranceId}
                        onChange={(e) => setFormData({ ...formData, insuranceId: e.target.value })}
                      >
                        <option value="">-- Pas d'assurance --</option>
                        {insurances.map(ins => (
                          <option key={ins.id} value={ins.id}>{ins.name} ({ins.coverage_percentage}%)</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {formData.insuranceId && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">N° Prise en Charge (PEC / Bon)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-teal-200 bg-teal-50/30 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-slate-400"
                        placeholder="Ex: PEC-2024-001"
                        value={formData.claimReference || ''}
                        onChange={(e) => setFormData({ ...formData, claimReference: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </section>

              {/* Total et Submit */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total à payer</p>
                  <p className="text-3xl font-black text-teal-600 tracking-tighter">{formatAmount(safeAmount)}</p>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-400 hover:bg-teal-500 text-slate-900 px-8 py-3 rounded-xl font-black shadow-lg shadow-teal-200 active:scale-95 transition-all"
                  >
                    Créer le Ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal d'impression */}
      {printTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Imprimer Ticket</h3>
              <button
                onClick={() => setPrintTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-2"
              >
                <XCircle className="w-8 h-8" />
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl p-8 mb-8 bg-white shadow-sm overflow-hidden" id="ticket-print">
              {/* Header du ticket */}
              <div className="text-center mb-6 pb-4 border-b-2 border-slate-800">
                <div className="text-2xl font-bold mb-2 uppercase tracking-tighter">{currentCenter.name}</div>
              </div>

              {/* Informations du ticket */}
              <div className="space-y-4 mb-8 text-sm">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Patient</div>
                  <div className="font-bold text-slate-900 text-lg">{printTicket.patientName}</div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-8 p-4 border border-slate-100 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-4 tracking-widest">Services Facturés</div>
                {printTicket.services?.map((service, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <div className="font-bold text-slate-800">{service.name}</div>
                    <div className="font-black text-slate-900">{service.price.toLocaleString()} F</div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="space-y-2">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-xs font-bold text-slate-600 uppercase">Montant Total</div>
                  <div className="font-black text-slate-900 text-xl">{(printTicket.amount || 0).toLocaleString()} F</div>
                </div>
                <div className="flex justify-between items-center p-4 bg-teal-50 rounded-xl">
                  <div className="text-xs font-bold text-teal-600 uppercase">Montant Payé</div>
                  <div className="font-black text-teal-700 text-2xl">{(printTicket.amount || 0).toLocaleString()} F</div>
                </div>
              </div>

              <div className="text-center p-4 border-t border-slate-100 mt-6 text-[10px] text-slate-400 uppercase font-black tracking-widest">
                Merci de votre confiance
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  const printContent = document.querySelector('.bg-white.border.border-slate-200.rounded-xl.p-8');
                  if (printContent) {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Ticket - ${printTicket.ticketNumber}</title>
                          <style>
                            body { font-family: 'Inter', system-ui, sans-serif; padding: 20px; }
                            .text-center { text-align: center; }
                            .font-bold { font-weight: bold; }
                            .mb-2 { margin-bottom: 0.5rem; }
                            .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                            .border-b-2 { border-bottom: 2px solid #000; }
                            .py-2 { padding: 10px 0; }
                            .text-xl { font-size: 1.25rem; font-weight: 800; }
                            .text-xs { font-size: 0.75rem; color: #666; }
                            @media print { body { padding: 0; } }
                          </style>
                        </head>
                        <body>${printContent.innerHTML}</body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => printWindow.print(), 300);
                    }
                  }
                }}
                className="flex-1 bg-teal-400 hover:bg-teal-500 text-slate-900 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-black shadow-xl shadow-teal-100 active:scale-95 transition-all"
              >
                <Printer className="w-6 h-6" />
                Imprimer le Ticket
              </button>
              <button
                onClick={() => setPrintTicket(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-black active:scale-95 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
